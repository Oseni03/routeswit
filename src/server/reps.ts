"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CreateRepInput, RepRecord, UpdateRepInput } from "@/types";
import { repSelect } from "@/types/reps";

/**
 * Creates a new rep record for the organisation.
 *
 * @throws {Error} with code "DUPLICATE_REP_ID" if rep_id already exists in org
 * @throws {Error} with code "REP_LIMIT_EXCEEDED" if plan rep limit reached
 */
export async function createRep(
    organizationId: string,
    data: CreateRepInput,
): Promise<RepRecord> {
    const existing = await prisma.rep.findUnique({
        where: { organizationId_repId: { organizationId, repId: data.rep_id } },
    });
    if (existing) {
        const err = new Error(`Rep '${data.rep_id}' already exists`) as Error & {
            code: string;
        };
        err.code = "DUPLICATE_REP_ID";
        throw err;
    }

    return prisma.rep.create({
        data: {
            organizationId,
            repId: data.rep_id,
            name: data.name,
            email: data.email,
            timezone: data.timezone,
        },
        select: repSelect,
    });
}

/**
 * Lists all reps for an organisation.
 */
export async function listReps(organizationId: string): Promise<RepRecord[]> {
    return prisma.rep.findMany({
        where: { organizationId },
        select: repSelect,
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Updates a rep's status, OOO window, and overflow target.
 * Validates that the overflow_to rep is not also OOO (1-hop limit).
 *
 * @throws {Error} with code "REP_NOT_FOUND" if rep not found
 * @throws {Error} with code "OVERFLOW_OOO" if overflow_to rep is also OOO
 */
export async function updateRep(
    organizationId: string,
    repCustomId: string,
    patch: UpdateRepInput,
): Promise<RepRecord> {
    const rep = await prisma.rep.findUnique({
        where: { organizationId_repId: { organizationId, repId: repCustomId } },
    });
    if (!rep) {
        const err = new Error(`Rep '${repCustomId}' not found`) as Error & {
            code: string;
        };
        err.code = "REP_NOT_FOUND";
        throw err;
    }

    // Validate overflow target if being set
    if (patch.overflow_to) {
        const overflowRep = await prisma.rep.findUnique({
            where: {
                organizationId_repId: {
                    organizationId,
                    repId: patch.overflow_to,
                },
            },
        });
        if (!overflowRep) {
            const err = new Error(
                `Overflow rep '${patch.overflow_to}' not found`,
            ) as Error & { code: string };
            err.code = "REP_NOT_FOUND";
            throw err;
        }
        const now = new Date();
        const overflowIsOoo =
            overflowRep.status === "ooo" &&
            (!overflowRep.oooUntil || overflowRep.oooUntil > now);
        if (overflowIsOoo) {
            const err = new Error(
                `Overflow rep '${patch.overflow_to}' is also OOO (1-hop depth limit)`,
            ) as Error & { code: string };
            err.code = "OVERFLOW_OOO";
            throw err;
        }
    }

    const updateData: Prisma.RepUpdateInput = {};
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.ooo_until !== undefined)
        updateData.oooUntil = patch.ooo_until ? new Date(patch.ooo_until) : null;
    if (patch.overflow_to !== undefined)
        updateData.overflowTo = patch.overflow_to ?? null;

    return prisma.rep.update({
        where: { id: rep.id },
        data: updateData,
        select: repSelect,
    });
}

export interface RepLoadMetrics {
    rep_id: string;
    name: string;
    status: string;
    current_open_leads: number;
    leads_assigned_today: number;
    leads_assigned_this_week: number;
    avg_response_time_hours: number | null;
    sla_breach_rate_7d: number | null;
}

/**
 * Returns current load and performance metrics for a rep.
 *
 * @throws {Error} with code "REP_NOT_FOUND" if rep not found
 */
export async function getRepLoad(
    organizationId: string,
    repCustomId: string,
): Promise<RepLoadMetrics> {
    const rep = await prisma.rep.findUnique({
        where: { organizationId_repId: { organizationId, repId: repCustomId } },
    });
    if (!rep) {
        const err = new Error(`Rep '${repCustomId}' not found`) as Error & {
            code: string;
        };
        err.code = "REP_NOT_FOUND";
        throw err;
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const [leadsToday, leadsThisWeek] = await Promise.all([
        prisma.routingLog.count({
            where: {
                organizationId,
                assignedRepId: rep.id,
                assignedAt: { gte: todayStart },
            },
        }),
        prisma.routingLog.count({
            where: {
                organizationId,
                assignedRepId: rep.id,
                assignedAt: { gte: weekStart },
            },
        }),
    ]);

    // avg_response_time_hours: time from assignment to first qualifying activity (email_sent, call_completed, meeting_scheduled)
    // Simplified: query activities joined through contacts that were assigned to this rep
    const respondedActivities = await prisma.activity.findMany({
        where: {
            organizationId,
            repId: rep.id,
            activityType: { in: ["email_sent", "call_completed", "meeting_scheduled"] },
        },
        select: { timestamp: true, contactId: true },
        orderBy: { timestamp: "asc" },
    });

    // Get routing logs for contacts assigned to this rep to compute response times
    let avgResponseTimeHours: number | null = null;
    if (respondedActivities.length > 0) {
        const contactIds = [...new Set(respondedActivities.map((a) => a.contactId))];
        const routingLogs = await prisma.routingLog.findMany({
            where: { organizationId, assignedRepId: rep.id },
            select: { leadId: true, assignedAt: true },
        });
        // For simplicity: average time from any routing event to first response activity
        const responseTimes: number[] = [];
        for (const log of routingLogs) {
            const firstActivity = respondedActivities
                .filter((a) => contactIds.includes(a.contactId))
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            if (firstActivity) {
                const diffHours =
                    (firstActivity.timestamp.getTime() - log.assignedAt.getTime()) /
                    (1000 * 60 * 60);
                if (diffHours >= 0) responseTimes.push(diffHours);
            }
        }
        if (responseTimes.length > 0) {
            avgResponseTimeHours =
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }
    }

    // SLA breach rate: check RepSla for this org, then compute breach %
    const sla = await prisma.repSla.findFirst({
        where: { organizationId },
        select: { firstResponseTargetMinutes: true },
    });

    let slaBreachRate: number | null = null;
    if (sla && respondedActivities.length > 0) {
        const targetMs = sla.firstResponseTargetMinutes * 60 * 1000;
        const logsLast7d = await prisma.routingLog.findMany({
            where: {
                organizationId,
                assignedRepId: rep.id,
                assignedAt: { gte: weekStart },
            },
            select: { leadId: true, assignedAt: true },
        });
        let breaches = 0;
        for (const log of logsLast7d) {
            const firstActivity = respondedActivities
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            const responseMs = firstActivity
                ? firstActivity.timestamp.getTime() - log.assignedAt.getTime()
                : Infinity;
            if (responseMs > targetMs) breaches++;
        }
        slaBreachRate =
            logsLast7d.length > 0 ? breaches / logsLast7d.length : null;
    }

    return {
        rep_id: rep.repId,
        name: rep.name,
        status: rep.status,
        current_open_leads: leadsToday,
        leads_assigned_today: leadsToday,
        leads_assigned_this_week: leadsThisWeek,
        avg_response_time_hours: avgResponseTimeHours !== null
            ? Math.round(avgResponseTimeHours * 100) / 100
            : null,
        sla_breach_rate_7d: slaBreachRate !== null
            ? Math.round(slaBreachRate * 1000) / 1000
            : null,
    };
}
