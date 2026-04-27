import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { updateRep } from "@/server/reps";

const UpdateRepSchema = z.object({
    status: z.enum(["active", "ooo", "inactive"]).optional(),
    ooo_until: z.string().datetime({ offset: true }).nullable().optional(),
    overflow_to: z.string().nullable().optional(),
});

/**
 * PATCH /api/v1/route/[org]/reps/[rep_id]
 * Updates a rep's status, OOO window, or overflow target.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ org: string; rep_id: string }> },
): Promise<NextResponse> {
    const { org: organizationId, rep_id } = await params;

    const ctx = await resolveApiAuth(organizationId);
    if (ctx instanceof NextResponse) return ctx;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = UpdateRepSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const rep = await updateRep(organizationId, rep_id, parsed.data);
        return NextResponse.json({ data: rep });
    } catch (err) {
        return domainError(err);
    }
}
