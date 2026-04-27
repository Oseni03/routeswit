import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { createOrUpdateStaleAlert } from "@/server/analytics";

const StaleAlertSchema = z.object({
    ruleset_id: z.string().min(1),
    no_activity_hours: z.number().int().min(1).max(8760),
    alert_type: z.literal("webhook"),
    webhook_url: z.string().url(),
    cooldown_hours: z.number().int().min(1).max(168).optional(),
});

/**
 * POST /api/v1/route/[org]/alerts/stale
 * Creates or updates a stale-deal alert configuration for a ruleset.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
    const { org: organizationId } = await params;

    const ctx = await resolveApiAuth(organizationId);
    if (ctx instanceof NextResponse) return ctx;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = StaleAlertSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const result = await createOrUpdateStaleAlert(organizationId, parsed.data);
        return NextResponse.json({ data: result }, { status: 201 });
    } catch (err) {
        return domainError(err);
    }
}
