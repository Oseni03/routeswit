import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
    resolveApiAuth,
    domainError,
    apiErr,
} from "@/lib/route-api-auth";
import { createOrReplaceRuleset, listRulesets } from "@/server/routing";

const RuleConditionSchema = z.object({
    field: z.string().min(1),
    operator: z.enum([
        "eq",
        "gte",
        "lte",
        "gt",
        "lt",
        "in",
        "not_in",
        "between",
    ]),
    value: z.unknown(),
});

const AssignmentSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("specific_rep"),
        rep_id: z.string().min(1),
    }),
    z.object({
        type: z.literal("round_robin"),
        pool: z.array(z.string()).min(1),
        method: z.literal("equal_distribution"),
    }),
    z.object({
        type: z.literal("territory"),
        territory_field: z.string().min(1),
        territory_map: z.record(z.string(), z.array(z.string())),
    }),
]);

const RoutingRuleSchema = z.object({
    priority: z.number().int().min(1),
    name: z.string().min(1),
    conditions: z.array(RuleConditionSchema),
    assignment: AssignmentSchema,
});

const CreateRulesetSchema = z.object({
    ruleset_id: z
        .string()
        .min(1)
        .max(64)
        .regex(
            /^[a-z0-9_-]+$/,
            "ruleset_id must be lowercase alphanumeric, hyphens, or underscores",
        ),
    name: z.string().min(1).max(128),
    rules: z.array(RoutingRuleSchema).min(1),
    fallback: z.object({
        type: z.literal("queue"),
        queue_id: z.string().min(1),
    }),
});

/**
 * GET /api/v1/rules
 * Lists all active rulesets for the organisation.
 */
export async function GET(): Promise<NextResponse> {
    const ctx = await resolveApiAuth();
    if (ctx instanceof NextResponse) return ctx;

    const organizationId = ctx.organizationId;

    try {
        const rulesets = await listRulesets(organizationId);
        return NextResponse.json({ data: rulesets });
    } catch (err) {
        return domainError(err);
    }
}

/**
 * POST /api/v1/rules
 * Creates or replaces a named ruleset.
 */
export async function POST(
    req: NextRequest
): Promise<NextResponse> {
    const ctx = await resolveApiAuth();
    if (ctx instanceof NextResponse) return ctx;

    const organizationId = ctx.organizationId;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = CreateRulesetSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr("VALIDATION_ERROR", parsed.error.message, 422);
    }

    const priorities = parsed.data.rules.map((rule) => rule.priority);
    if (new Set(priorities).size !== priorities.length) {
        return apiErr(
            "VALIDATION_ERROR",
            "Duplicate rule priorities are not allowed.",
            422,
        );
    }



    try {
        const result = await createOrReplaceRuleset(
            organizationId,
            parsed.data,
        );
        return NextResponse.json({ data: result }, { status: 201 });
    } catch (err) {
        return domainError(err);
    }
}
