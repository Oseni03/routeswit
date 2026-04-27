import { type NextRequest, NextResponse } from "next/server";
import { resolveApiAuth, domainError, apiErr } from "@/lib/route-api-auth";
import { getAnalyticsSummary } from "@/server/analytics";
import { PLAN_LIMITS } from "@/lib/route-api-auth";

/**
 * GET /api/v1/route/[org]/analytics/summary?period=YYYY-MM&ruleset_id=...
 * Returns aggregate routing analytics for the specified period.
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
	const { org: organizationId } = await params;

	const ctx = await resolveApiAuth(organizationId);
	if (ctx instanceof NextResponse) return ctx;

	const { searchParams } = new URL(req.url);
	const period = searchParams.get("period");
	const rulesetId = searchParams.get("ruleset_id") ?? undefined;

	if (!period) {
		return apiErr("VALIDATION_ERROR", "period query parameter is required (YYYY-MM).", 422);
	}

	// Billing gate: analytics period range
	const maxMonths = PLAN_LIMITS[ctx.tier].analytics_months;
	const periodMatch = /^(\d{4})-(\d{2})$/.exec(period);
	if (periodMatch) {
		const now = new Date();
		const periodDate = new Date(parseInt(periodMatch[1]), parseInt(periodMatch[2]) - 1, 1);
		const monthsDiff =
			(now.getFullYear() - periodDate.getFullYear()) * 12 +
			(now.getMonth() - periodDate.getMonth());
		if (monthsDiff > maxMonths) {
			return apiErr(
				"ANALYTICS_PERIOD_EXCEEDED",
				`Your plan supports up to ${maxMonths} month(s) of historical analytics. Upgrade to Pro for 12 months.`,
				402,
			);
		}
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
