import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
    resolveApiAuth,
    checkRepLimit,
    domainError,
    apiErr,
} from "@/lib/route-api-auth";
import { createRep, listReps } from "@/server/reps";

const CreateRepSchema = z.object({
    rep_id: z
        .string()
        .min(1)
        .max(64)
        .regex(/^[a-zA-Z0-9_-]+$/, "rep_id must be alphanumeric, hyphens, or underscores"),
    name: z.string().min(1).max(128),
    email: z.string().email(),
    timezone: z.string().optional(),
});

/**
 * GET /api/v1/route/[org]/reps
 * Lists all reps for the organisation.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
    const { org: organizationId } = await params;

    const ctx = await resolveApiAuth(organizationId);
    if (ctx instanceof NextResponse) return ctx;

    try {
        const reps = await listReps(organizationId);
        return NextResponse.json({ data: reps });
    } catch (err) {
        return domainError(err);
    }
}

/**
 * POST /api/v1/route/[org]/reps
 * Creates a new rep.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
    const { org: organizationId } = await params;

    const ctx = await resolveApiAuth(organizationId);
    if (ctx instanceof NextResponse) return ctx;

    const repLimitErr = await checkRepLimit(organizationId, ctx.tier);
    if (repLimitErr) return repLimitErr;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return apiErr("BAD_REQUEST", "Request body is not valid JSON.", 400);
    }

    const parsed = CreateRepSchema.safeParse(body);
    if (!parsed.success) {
        return apiErr(
            "VALIDATION_ERROR",
            parsed.error.message,
            422,
        );
    }

    try {
        const rep = await createRep(organizationId, parsed.data);
        return NextResponse.json({ data: rep }, { status: 201 });
    } catch (err) {
        return domainError(err);
    }
}
