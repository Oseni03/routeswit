import { type NextRequest, NextResponse } from "next/server";
import { resolveApiAuth, domainError } from "@/lib/route-api-auth";
import { getRuleset, softDeleteRuleset } from "@/server/routing";

/**
 * GET /api/v1/route/[org]/rules/[ruleset_id]
 * Returns a single ruleset with its parsed rules.
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ org: string; ruleset_id: string }> },
): Promise<NextResponse> {
	const { org: organizationId, ruleset_id } = await params;

	const ctx = await resolveApiAuth(organizationId);
	if (ctx instanceof NextResponse) return ctx;

	try {
		const ruleset = await getRuleset(organizationId, ruleset_id);
		if (!ruleset) {
			return NextResponse.json(
				{ error: { code: "RULESET_NOT_FOUND", message: `Ruleset '${ruleset_id}' not found.` } },
				{ status: 404 },
			);
		}
		return NextResponse.json({ data: ruleset });
	} catch (err) {
		return domainError(err);
	}
}

/**
 * DELETE /api/v1/route/[org]/rules/[ruleset_id]
 * Soft-deletes a ruleset. Routing history is preserved.
 */
export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ org: string; ruleset_id: string }> },
): Promise<NextResponse> {
	const { org: organizationId, ruleset_id } = await params;

	const ctx = await resolveApiAuth(organizationId);
	if (ctx instanceof NextResponse) return ctx;

	try {
		const deleted = await softDeleteRuleset(organizationId, ruleset_id);
		if (!deleted) {
			return NextResponse.json(
				{ error: { code: "RULESET_NOT_FOUND", message: `Ruleset '${ruleset_id}' not found.` } },
				{ status: 404 },
			);
		}
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		return domainError(err);
	}
}
