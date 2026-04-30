import { type NextRequest, NextResponse } from "next/server";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { getAnalyticsSummary } from "@/server/analytics";

/**
 * GET /api/v1/analytics/summary?period=YYYY-MM&ruleset_id=...
 * Returns aggregate routing analytics for the specified period.
 */
export async function GET(
	req: NextRequest
): Promise<NextResponse> {
	const ctx = await resolveApiAuth();
	if (ctx instanceof NextResponse) return ctx;

    const organizationId = ctx.organizationId;

	const { searchParams } = new URL(req.url);
	const period = searchParams.get("period");
	const rulesetId = searchParams.get("ruleset_id") ?? undefined;

	if (!period) {
		return apiErr("VALIDATION_ERROR", "period query parameter is required (YYYY-MM).", 422);
	}


	try {
		const summary = await getAnalyticsSummary(organizationId, period, rulesetId);
		return NextResponse.json({ data: summary });
	} catch (err) {
		if (err instanceof Error && err.message === "Invalid period format. Use YYYY-MM.") {
			return apiErr("VALIDATION_ERROR", err.message, 422);
		}
		return domainError(err);
	}
}
