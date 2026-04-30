"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
    RuleCondition,
    RoutingRule,
    FallbackConfig,
    RulesetData,
    RouteLeadResult,
} from "@/types";

const rulesetSummarySelect = {
    id: true,
    rulesetId: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    rulesJson: true,
} satisfies Prisma.RulesetSelect;

// ─── Ruleset CRUD ─────────────────────────────────────────────────────────────

/**
 * Creates or replaces a named ruleset for an organisation.
 * Replaces (soft-deletes the old one and creates a new record) if ruleset_id already exists.
 */
export async function createOrReplaceRuleset(
    organizationId: string,
    data: RulesetData,
): Promise<{ rulesetId: string; rulesCount: number; createdAt: Date }> {
    const rulesJson = JSON.stringify(data.rules);
    const fallbackJson = JSON.stringify(data.fallback);

    const result = await prisma.$transaction(async (tx) => {
        // Soft-delete any existing ruleset with the same ruleset_id
        await tx.ruleset.updateMany({
            where: { organizationId, rulesetId: data.ruleset_id, deletedAt: null },
            data: { deletedAt: new Date() },
        });

        return tx.ruleset.create({
            data: {
                organizationId,
                rulesetId: data.ruleset_id,
                name: data.name,
                rulesJson,
                fallbackJson,
            },
            select: { id: true, rulesetId: true, createdAt: true },
        });
    });

    return {
        rulesetId: result.rulesetId,
        rulesCount: data.rules.length,
        createdAt: result.createdAt,
    };
}

/**
 * Returns a single ruleset with parsed rules and fallback.
 */
export async function getRuleset(
    organizationId: string,
    rulesetId: string,
): Promise<
    | (Omit<
        Prisma.RulesetGetPayload<{ select: typeof rulesetSummarySelect }>,
        "rulesJson"
    > & { rules: RoutingRule[]; fallback: FallbackConfig; id: string })
    | null
> {
    const row = await prisma.ruleset.findFirst({
        where: { organizationId, rulesetId, deletedAt: null },
        select: { ...rulesetSummarySelect, fallbackJson: true },
    });
    if (!row) return null;
    const { rulesJson, fallbackJson, ...rest } = row;
    return {
        ...rest,
        rules: JSON.parse(rulesJson) as RoutingRule[],
        fallback: JSON.parse(fallbackJson) as FallbackConfig,
    };
}

/**
 * Lists all active rulesets for an organisation (summary only).
 */
export async function listRulesets(
    organizationId: string,
): Promise<Array<{ rulesetId: string; name: string; rulesCount: number; createdAt: Date }>> {
    const rows = await prisma.ruleset.findMany({
        where: { organizationId, deletedAt: null },
        select: rulesetSummarySelect,
        orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => ({
        rulesetId: r.rulesetId,
        name: r.name,
        rulesCount: (JSON.parse(r.rulesJson) as unknown[]).length,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    }));
}

/**
 * Soft-deletes a ruleset. Routing history is preserved.
 */
export async function softDeleteRuleset(
    organizationId: string,
    rulesetId: string,
): Promise<boolean> {
    const result = await prisma.ruleset.updateMany({
        where: { organizationId, rulesetId, deletedAt: null },
        data: { deletedAt: new Date() },
    });
    return result.count > 0;
}

// ─── Rule Evaluation ──────────────────────────────────────────────────────────

/**
 * Evaluates a single condition against the lead's attributes.
 */
function evaluateCondition(
    condition: RuleCondition,
    attributes: Record<string, unknown>,
): boolean {
    const attrValue = attributes[condition.field];
    const condValue = condition.value;

    switch (condition.operator) {
        case "eq":
            return attrValue === condValue;
        case "gte":
            return typeof attrValue === "number" && typeof condValue === "number"
                ? attrValue >= condValue
                : false;
        case "lte":
            return typeof attrValue === "number" && typeof condValue === "number"
                ? attrValue <= condValue
                : false;
        case "gt":
            return typeof attrValue === "number" && typeof condValue === "number"
                ? attrValue > condValue
                : false;
        case "lt":
            return typeof attrValue === "number" && typeof condValue === "number"
                ? attrValue < condValue
                : false;
        case "in":
            return Array.isArray(condValue) && condValue.includes(attrValue);
        case "not_in":
            return Array.isArray(condValue) && !condValue.includes(attrValue);
        case "between": {
            if (
                !Array.isArray(condValue) ||
                condValue.length !== 2 ||
                typeof attrValue !== "number"
            )
                return false;
            const [min, max] = condValue as [number, number];
            return attrValue >= min && attrValue <= max;
        }
        default:
            return false;
    }
}

/**
 * Atomically increments the round-robin counter for a ruleset rule.
 * Returns the index (0-based) to use for the current assignment.
 */
export async function getRoundRobinIndex(
    organizationId: string,
    rulesetDbId: string,
    rulePriority: number,
    poolSize: number,
): Promise<number> {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.roundRobinState.findUnique({
            where: {
                organizationId_rulesetId_rulePriority: {
                    organizationId,
                    rulesetId: rulesetDbId,
                    rulePriority,
                },
            },
        });

        const indexToUse = existing?.currentIndex ?? 0;
        const nextIndex = (indexToUse + 1) % poolSize;

        if (existing) {
            await tx.roundRobinState.update({
                where: {
                    organizationId_rulesetId_rulePriority: {
                        organizationId,
                        rulesetId: rulesetDbId,
                        rulePriority,
                    },
                },
                data: { currentIndex: nextIndex },
            });
        } else {
            await tx.roundRobinState.create({
                data: {
                    organizationId,
                    rulesetId: rulesetDbId,
                    rulePriority,
                    currentIndex: nextIndex,
                },
            });
        }

        return indexToUse;
    });
}

/**
 * Routes a lead against a ruleset.
 * Evaluates rules in priority order (first match wins).
 * Writes an immutable RoutingLog entry.
 *
 * @throws {Error} with code "RULESET_NOT_FOUND" if ruleset not found
 * @throws {Error} with code "OVERFLOW_OOO" if overflow rep is also OOO
 * @throws {Error} with code "NO_REP_AVAILABLE" if no eligible rep found
 */
export async function routeLead(
    organizationId: string,
    rulesetCustomId: string,
    leadId: string,
    attributes: Record<string, unknown>,
): Promise<RouteLeadResult> {
    const startMs = Date.now();

    // Load ruleset
    const rulesetRow = await prisma.ruleset.findFirst({
        where: { organizationId, rulesetId: rulesetCustomId, deletedAt: null },
    });
    if (!rulesetRow) {
        const err = new Error("Ruleset not found") as Error & { code: string };
        err.code = "RULESET_NOT_FOUND";
        throw err;
    }

    const rules = JSON.parse(rulesetRow.rulesJson) as RoutingRule[];
    const fallback = JSON.parse(rulesetRow.fallbackJson) as FallbackConfig;

    // Sort rules by priority ascending
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    let matchedRule: RoutingRule | null = null;
    let assignedRepDbId: string | null = null;
    let assignmentMethod = "fallback";
    let roundRobinPosition: number | null = null;
    let fallbackUsed = false;

    for (const rule of sortedRules) {
        const allMatch = rule.conditions.every((c) =>
            evaluateCondition(c, attributes),
        );
        if (!allMatch) continue;

        matchedRule = rule;
        const assignment = rule.assignment;

        if (assignment.type === "specific_rep") {
            const rep = await resolveRepForAssignment(organizationId, assignment.rep_id);
            assignedRepDbId = rep.id;
            assignmentMethod = "specific_rep";
        } else if (assignment.type === "round_robin") {
            const pool = assignment.pool;
            const idx = await getRoundRobinIndex(
                organizationId,
                rulesetRow.id,
                rule.priority,
                pool.length,
            );
            roundRobinPosition = idx;
            const repId = pool[idx];
            const rep = await resolveRepForAssignment(organizationId, repId);
            assignedRepDbId = rep.id;
            assignmentMethod = "round_robin";
        } else if (assignment.type === "territory") {
            const territoryValue = attributes[assignment.territory_field] as string;
            const pool =
                assignment.territory_map[territoryValue] ??
                assignment.territory_map["default"] ??
                [];
            if (pool.length === 0) {
                matchedRule = null;
                continue;
            }
            const repId = pool[0];
            const rep = await resolveRepForAssignment(organizationId, repId);
            assignedRepDbId = rep.id;
            assignmentMethod = "territory";
        }

        if (assignedRepDbId) break;
    }

    // Fallback
    if (!assignedRepDbId) {
        fallbackUsed = true;
        assignmentMethod = "fallback";
        matchedRule = null;
    }

    // Get rep details and current load
    const repDbRecord = assignedRepDbId
        ? await prisma.rep.findUnique({ where: { id: assignedRepDbId } })
        : null;

    // Count open leads for rep
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentLoad = assignedRepDbId
        ? await prisma.routingLog.count({
            where: {
                organizationId,
                assignedRepId: assignedRepDbId,
                assignedAt: { gte: today },
            },
        })
        : 0;

    const assignedAt = new Date();
    const routingTimeMs = Date.now() - startMs;

    // Write immutable RoutingLog
    await prisma.routingLog.create({
        data: {
            organizationId,
            leadId,
            rulesetId: rulesetRow.id,
            ruleMatched: matchedRule?.name ?? null,
            rulePriority: matchedRule?.priority ?? null,
            assignmentMethod,
            assignedRepId: assignedRepDbId,
            fallbackUsed,
            attributesJson: JSON.stringify(attributes),
            repStateJson: JSON.stringify(repDbRecord ?? { fallback_queue: fallback.queue_id }),
            routingTimeMs,
            assignedAt,
        },
    });

    if (!repDbRecord && !fallbackUsed) {
        const err = new Error("No rep available") as Error & { code: string };
        err.code = "NO_REP_AVAILABLE";
        throw err;
    }

    return {
        lead_id: leadId,
        assigned_to: repDbRecord
            ? {
                rep_id: repDbRecord.repId,
                name: repDbRecord.name,
                email: repDbRecord.email,
                current_load: currentLoad,
            }
            : { rep_id: "", name: "Fallback Queue", email: "", current_load: 0 },
        rule_matched: matchedRule?.name ?? null,
        rule_priority: matchedRule?.priority ?? null,
        assignment_method: assignmentMethod,
        round_robin_position: roundRobinPosition,
        assigned_at: assignedAt.toISOString(),
        fallback_used: fallbackUsed,
    };
}

/**
 * Resolves a rep for assignment, following the overflow chain (max 1 hop).
 *
 * @throws {Error} with code "OVERFLOW_OOO" if overflow rep is also OOO
 * @throws {Error} with code "REP_NOT_FOUND" if rep_id not found
 */
async function resolveRepForAssignment(
    organizationId: string,
    repCustomId: string,
): Promise<Prisma.RepGetPayload<object>> {
    const rep = await prisma.rep.findUnique({
        where: { organizationId_repId: { organizationId, repId: repCustomId } },
    });

    if (!rep) {
        const err = new Error(`Rep '${repCustomId}' not found`) as Error & { code: string };
        err.code = "REP_NOT_FOUND";
        throw err;
    }

    const now = new Date();
    const isOoo =
        rep.status === "ooo" && (!rep.oooUntil || rep.oooUntil > now);

    // OOO auto-expiry: if oooUntil is in the past, treat as active
    if (rep.status === "ooo" && rep.oooUntil && rep.oooUntil <= now) {
        await prisma.rep.update({
            where: { id: rep.id },
            data: { status: "active", oooUntil: null, overflowTo: null },
        });
        return { ...rep, status: "active", oooUntil: null, overflowTo: null };
    }

    if (!isOoo) return rep;

    // Follow overflow (1 hop only)
    if (!rep.overflowTo) {
        const err = new Error(
            `Rep '${repCustomId}' is OOO and has no overflow configured`,
        ) as Error & { code: string };
        err.code = "OVERFLOW_OOO";
        throw err;
    }

    const overflowRep = await prisma.rep.findUnique({
        where: { organizationId_repId: { organizationId, repId: rep.overflowTo } },
    });

    if (!overflowRep) {
        const err = new Error(`Overflow rep '${rep.overflowTo}' not found`) as Error & {
            code: string;
        };
        err.code = "REP_NOT_FOUND";
        throw err;
    }

    const overflowIsOoo =
        overflowRep.status === "ooo" &&
        (!overflowRep.oooUntil || overflowRep.oooUntil > now);

    if (overflowIsOoo) {
        const err = new Error(
            `Overflow rep '${rep.overflowTo}' is also OOO (depth limit exceeded)`,
        ) as Error & { code: string };
        err.code = "OVERFLOW_OOO";
        throw err;
    }

    return overflowRep;
}
