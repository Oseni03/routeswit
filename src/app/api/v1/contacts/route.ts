import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { upsertContact } from "@/server/contacts";

const CreateContactSchema = z.object({
    contact_id: z.string().min(1).max(128),
    email: z.string().email(),
    name: z.string().max(128).optional(),
    lead_id: z.string().max(128).optional(),
});

/**
 * POST /api/v1/contacts
 * Creates a contact or returns the existing one (idempotent).
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

    const parsed = CreateContactSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const result = await upsertContact(organizationId, parsed.data);
        const status = result.exists ? 200 : 201;

        // Map to snake_case for API consistency
        const contact = {
            id: result.id,
            contact_id: result.contactId,
            email: result.email,
            name: result.name,
            lead_id: result.leadId,
            created_at: result.createdAt,
        };

        return NextResponse.json({ data: contact }, { status });
    } catch (err) {
        return domainError(err);
    }
}
