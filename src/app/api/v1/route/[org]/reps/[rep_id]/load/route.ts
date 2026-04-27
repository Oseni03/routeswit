import { type NextRequest, NextResponse } from "next/server";
import { resolveApiAuth, domainError } from "@/lib/route-api-auth";
import { getRepLoad } from "@/server/reps";

/**
 * GET /api/v1/route/[org]/reps/[rep_id]/load
 * Returns current load and performance metrics for a rep.
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ org: string; rep_id: string }> },
): Promise<NextResponse> {
	const { org: organizationId, rep_id } = await params;

	const ctx = await resolveApiAuth(organizationId);
	if (ctx instanceof NextResponse) return ctx;

	try {
		const load = await getRepLoad(organizationId, rep_id);
		return NextResponse.json({ data: load });
	} catch (err) {
		return domainError(err);
	}
}
