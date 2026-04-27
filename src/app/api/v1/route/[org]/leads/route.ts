import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
    resolveApiAuth,
    checkLeadLimit,
    domainError,
    apiErr,
} from "@/lib/route-api-auth";
import { routeLead } from "@/server/routing";

const RouteLeadSchema = z.object({
    lead_id: z.string().min(1).max(128),
    ruleset_id: z.string().min(1),
    attributes: z.record(z.string(), z.unknown()),
});

/**
 * POST /api/v1/route/[org]/leads
 * Routes a lead against a ruleset and returns the assignment.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
    const { org: organizationId } = await params;

    const ctx = await resolveApiAuth(organizationId);
    if (ctx instanceof NextResponse) return ctx;

    // Billing gate: monthly lead volume
    const leadLimitErr = await checkLeadLimit(organizationId, ctx.tier);
    if (leadLimitErr) return leadLimitErr;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = RouteLeadSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const result = await routeLead(
            organizationId,
            parsed.data.ruleset_id,
            parsed.data.lead_id,
            parsed.data.attributes as Record<string, unknown>,
        );
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (err) {
        return domainError(err);
    }
}
