import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { createOrUpdateSla } from "@/server/analytics";

const SlaSchema = z.object({
    ruleset_id: z.string().min(1),
    first_response_target_minutes: z.number().int().min(1).max(10080),
    alert_on_breach: z.boolean().default(true),
    alert_webhook: z.string().url().optional(),
});

/**
 * POST /api/v1/route/[org]/slas
 * Creates or updates an SLA configuration for a ruleset.
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

    const parsed = SlaSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const result = await createOrUpdateSla(organizationId, parsed.data);
        return NextResponse.json({ data: result }, { status: 201 });
    } catch (err) {
        return domainError(err);
    }
}
