"use server";

import { prisma } from "@/lib/prisma";
import { AnalyticsPeriod, RepDistribution, SpeedToLead } from "@/types"

/**
 * Parses a period string like "2026-03" into year/month.
 */
function parsePeriod(period: string): AnalyticsPeriod | null {
    const match = /^(\d{4})-(\d{2})$/.exec(period);
    if (!match) return null;
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    if (month < 1 || month > 12) return null;
    return { year, month };
}

/**
 * Returns aggregate routing analytics for a period.
 * Proactively surfaces fallback_rate_warning when fallback_rate > 5%.
 */
export async function getAnalyticsSummary(
    organizationId: string,
    period: string,
    rulesetCustomId?: string,
): Promise<{
    period: string;
    total_leads_routed: number;
    routing_breakdown: Record<string, number>;
    fallback_rate: number;
    fallback_rate_warning: boolean;
    avg_routing_time_ms: number | null;
    rep_distribution: RepDistribution[];
    speed_to_lead: SpeedToLead | null;
}> {
    const parsed = parsePeriod(period);
    if (!parsed) throw new Error("Invalid period format. Use YYYY-MM.");

    const start = new Date(parsed.year, parsed.month - 1, 1);
    const end = new Date(parsed.year, parsed.month, 1);

    // Ruleset filter
    let rulesetDbId: string | undefined;
    if (rulesetCustomId) {
        const ruleset = await prisma.ruleset.findFirst({
            where: { organizationId, rulesetId: rulesetCustomId, deletedAt: null },
            select: { id: true },
        });
        rulesetDbId = ruleset?.id;
    }

    const where = {
        organizationId,
        assignedAt: { gte: start, lt: end },
        ...(rulesetDbId ? { rulesetId: rulesetDbId } : {}),
    };

    const logs = await prisma.routingLog.findMany({
        where,
        select: {
            id: true,
            ruleMatched: true,
            fallbackUsed: true,
            routingTimeMs: true,
            assignedRepId: true,
            assignedAt: true,
            rep: { select: { repId: true, name: true } },
        },
    });

    const totalLeads = logs.length;
    const fallbackCount = logs.filter((l) => l.fallbackUsed).length;
    const fallbackRate = totalLeads > 0 ? fallbackCount / totalLeads : 0;

    // Routing breakdown by rule name
    const routingBreakdown: Record<string, number> = {};
    for (const log of logs) {
        const key = log.fallbackUsed
            ? "fallback_unassigned"
            : (log.ruleMatched ?? "unknown");
        routingBreakdown[key] = (routingBreakdown[key] ?? 0) + 1;
    }

    // Avg routing time
    const timings = logs.map((l) => l.routingTimeMs).filter((t): t is number => t !== null);
    const avgRoutingTimeMs =
        timings.length > 0
            ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
            : null;

    // Rep distribution
    const repStats: Record<
        string,
        { name: string; leads: number; repId: string }
    > = {};
    for (const log of logs) {
        if (!log.assignedRepId || !log.rep) continue;
        const key = log.assignedRepId;
        if (!repStats[key]) {
            repStats[key] = { name: log.rep.name, repId: log.rep.repId, leads: 0 };
        }
        repStats[key].leads++;
    }

    // Get activities for first response time and meeting rate per rep
    const repActivities = await prisma.activity.findMany({
        where: {
            organizationId,
            activityType: {
                in: ["email_sent", "call_completed", "meeting_scheduled", "meeting_completed", "demo_completed"],
            },
            timestamp: { gte: start, lt: end },
            repId: { not: null },
        },
        select: { repId: true, activityType: true, timestamp: true },
    });

    // Get SLA config
    const slaConfig = rulesetDbId
        ? await prisma.repSla.findUnique({
            where: { organizationId_rulesetId: { organizationId, rulesetId: rulesetDbId } },
            select: { firstResponseTargetMinutes: true },
        })
        : await prisma.repSla.findFirst({
            where: { organizationId },
            select: { firstResponseTargetMinutes: true },
        });

    const repDistribution: RepDistribution[] = Object.entries(repStats).map(
        ([dbId, stats]) => {
            const repLogs = logs.filter((l) => l.assignedRepId === dbId);
            const repActiv = repActivities.filter((a) => a.repId === dbId);

            const meetings = repActiv.filter((a) =>
                ["meeting_scheduled", "meeting_completed", "demo_completed"].includes(
                    a.activityType,
                ),
            ).length;

            const meetingRate =
                stats.leads > 0
                    ? Math.round((meetings / stats.leads) * 1000) / 1000
                    : 0;

            // First response time per lead
            const responseTimesMinutes: number[] = [];
            for (const log of repLogs) {
                const firstResp = repActiv
                    .filter((a) =>
                        ["email_sent", "call_completed", "meeting_scheduled"].includes(
                            a.activityType,
                        ),
                    )
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
                if (firstResp) {
                    const mins =
                        (firstResp.timestamp.getTime() - log.assignedAt.getTime()) /
                        (1000 * 60);
                    if (mins >= 0) responseTimesMinutes.push(mins);
                }
            }
            const avgFirstResponse =
                responseTimesMinutes.length > 0
                    ? Math.round(
                        responseTimesMinutes.reduce((a, b) => a + b, 0) /
                        responseTimesMinutes.length,
                    )
                    : null;

            // SLA met rate
            let slaMet: number | null = null;
            if (slaConfig && responseTimesMinutes.length > 0) {
                const target = slaConfig.firstResponseTargetMinutes;
                const met = responseTimesMinutes.filter((m) => m <= target).length;
                slaMet = Math.round((met / responseTimesMinutes.length) * 1000) / 1000;
            }

            return {
                rep_id: stats.repId,
                leads_assigned: stats.leads,
                avg_first_response_minutes: avgFirstResponse,
                sla_met_rate: slaMet,
                meetings_booked: meetings,
                meeting_rate: meetingRate,
            };
        },
    );

    // Speed-to-lead overall
    const allResponseMinutes: number[] = [];
    for (const log of logs) {
        if (!log.assignedRepId) continue;
        const firstResp = repActivities
            .filter(
                (a) =>
                    a.repId === log.assignedRepId &&
                    ["email_sent", "call_completed", "meeting_scheduled"].includes(
                        a.activityType,
                    ),
            )
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
        if (firstResp) {
            const mins =
                (firstResp.timestamp.getTime() - log.assignedAt.getTime()) / (1000 * 60);
            if (mins >= 0) allResponseMinutes.push(mins);
        }
    }

    let speedToLead: SpeedToLead | null = null;
    if (allResponseMinutes.length > 0) {
        const sorted = [...allResponseMinutes].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p90 = sorted[Math.floor(sorted.length * 0.9)];
        const target = slaConfig?.firstResponseTargetMinutes ?? 60;
        const slaMet = allResponseMinutes.filter((m) => m <= target).length;

        speedToLead = {
            median_minutes: Math.round(median),
            p90_minutes: Math.round(p90),
            sla_target_minutes: target,
            sla_met_rate: Math.round((slaMet / allResponseMinutes.length) * 1000) / 1000,
        };
    }

    return {
        period,
        total_leads_routed: totalLeads,
        routing_breakdown: routingBreakdown,
        fallback_rate: Math.round(fallbackRate * 10000) / 10000,
        fallback_rate_warning: fallbackRate > 0.05,
        avg_routing_time_ms: avgRoutingTimeMs,
        rep_distribution: repDistribution,
        speed_to_lead: speedToLead,
    };
}

/**
 * Creates or updates an SLA configuration for a ruleset.
 */
export async function createOrUpdateSla(
    organizationId: string,
    data: {
        ruleset_id: string;
        first_response_target_minutes: number;
        alert_on_breach: boolean;
        alert_webhook?: string;
    },
): Promise<{ id: string; rulesetId: string }> {
    const ruleset = await prisma.ruleset.findFirst({
        where: { organizationId, rulesetId: data.ruleset_id, deletedAt: null },
        select: { id: true },
    });
    if (!ruleset) {
        const err = new Error(`Ruleset '${data.ruleset_id}' not found`) as Error & {
            code: string;
        };
        err.code = "RULESET_NOT_FOUND";
        throw err;
    }

    const result = await prisma.repSla.upsert({
        where: { organizationId_rulesetId: { organizationId, rulesetId: ruleset.id } },
        create: {
            organizationId,
            rulesetId: ruleset.id,
            firstResponseTargetMinutes: data.first_response_target_minutes,
            alertOnBreach: data.alert_on_breach,
            alertWebhook: data.alert_webhook,
        },
        update: {
            firstResponseTargetMinutes: data.first_response_target_minutes,
            alertOnBreach: data.alert_on_breach,
            alertWebhook: data.alert_webhook,
        },
        select: { id: true, rulesetId: true },
    });

    return { id: result.id, rulesetId: data.ruleset_id };
}

/**
 * Creates or updates a stale-deal alert configuration for a ruleset.
 */
export async function createOrUpdateStaleAlert(
    organizationId: string,
    data: {
        ruleset_id: string;
        no_activity_hours: number;
        alert_type: "webhook";
        webhook_url: string;
        cooldown_hours?: number;
    },
): Promise<{ id: string; rulesetId: string }> {
    const ruleset = await prisma.ruleset.findFirst({
        where: { organizationId, rulesetId: data.ruleset_id, deletedAt: null },
        select: { id: true },
    });
    if (!ruleset) {
        const err = new Error(`Ruleset '${data.ruleset_id}' not found`) as Error & {
            code: string;
        };
        err.code = "RULESET_NOT_FOUND";
        throw err;
    }

    const result = await prisma.staleAlert.upsert({
        where: { organizationId_rulesetId: { organizationId, rulesetId: ruleset.id } },
        create: {
            organizationId,
            rulesetId: ruleset.id,
            noActivityHours: data.no_activity_hours,
            alertType: data.alert_type,
            webhookUrl: data.webhook_url,
            cooldownHours: data.cooldown_hours ?? 24,
        },
        update: {
            noActivityHours: data.no_activity_hours,
            alertType: data.alert_type,
            webhookUrl: data.webhook_url,
            cooldownHours: data.cooldown_hours ?? 24,
        },
        select: { id: true, rulesetId: true },
    });

    return { id: result.id, rulesetId: data.ruleset_id };
}

/**
 * Stub: fires stale-deal alerts.
 * TODO: call this from a cron job / background worker in v2.
 */
export async function checkAndFireStaleAlerts(): Promise<void> {
    // Stub — delivery mechanism is out of scope for v1.
    // When implemented: query contacts with no activity for > no_activity_hours,
    // check cooldown, POST to webhook_url with lead + rep + time details.
    console.log("[stub] checkAndFireStaleAlerts called — no-op in v1");
}
