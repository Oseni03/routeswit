import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { logActivity, getContactActivities } from "@/server/contacts";
import { ACTIVITY_TYPES } from "@/types/contacts";

const LogActivitySchema = z.object({
    activity_type: z.enum(ACTIVITY_TYPES),
    timestamp: z.string().datetime({ offset: true }),
    rep_id: z.string().optional(),
    duration_minutes: z.number().int().min(0).optional(),
    outcome: z.string().max(64).optional(),
    notes: z.string().max(2000).optional(),
    subject: z.string().max(256).optional(),
    meeting_time: z.string().datetime({ offset: true }).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/v1/contacts/[contact_id]/activities
 * Returns the activity feed for a contact.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ contact_id: string }> },
): Promise<NextResponse> {
    const { contact_id } = await params;

    const ctx = await resolveApiAuth();
    if (ctx instanceof NextResponse) return ctx;

    const organizationId = ctx.organizationId;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const activity_type = searchParams.get("activity_type") ?? undefined;

    try {
        const result = await getContactActivities(organizationId, contact_id, {
            limit,
            offset,
            activity_type,
        });
        return NextResponse.json({ data: result });
    } catch (err) {
        return domainError(err);
    }
}

/**
 * POST /api/v1/contacts/[contact_id]/activities
 * Logs an activity against a contact. Idempotent by (contact_id, activity_type, timestamp).
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ contact_id: string }> },
): Promise<NextResponse> {
    const { contact_id } = await params;

    const ctx = await resolveApiAuth();
    if (ctx instanceof NextResponse) return ctx;

    const organizationId = ctx.organizationId;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = LogActivitySchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const result = await logActivity(organizationId, contact_id, parsed.data);
        const status = result.deduplicated ? 200 : 201;
        return NextResponse.json({ data: result }, { status });
    } catch (err) {
        return domainError(err);
    }
}
