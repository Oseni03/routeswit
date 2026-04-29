/**
 * Shared helper for Route API v1 route handlers.
 *
 * Responsibilities:
 *  1. Verify the `Authorization: Bearer sk_…` API key via BetterAuth
 *  2. Resolve the organisation the key belongs to
 *  3. Enforce billing entitlement (plan limits)
 *  4. Return standard error responses in { error: { code, message } } shape
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/utils";

// ─── Plan limits ─────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
	free: {
		monthly_leads: 500,
		reps: 5,
		rulesets: 1,
		analytics_months: 1,
	},
	pro: {
		monthly_leads: Infinity,
		reps: Infinity,
		rulesets: Infinity,
		analytics_months: 12,
	},
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

/**
 * Maps a Polar productId to a plan tier key.
 */
export function getTier(productId: string | null | undefined): PlanTier {
	const plan = SUBSCRIPTION_PLANS.find((p) => p.productId === productId);
	if (!plan) return "free";
	return plan.id === "pro" ? "pro" : "free";
}

// ─── Standard response shapes ─────────────────────────────────────────────────

export type ApiError = { error: { code: string; message: string } };

export function apiErr(
	code: string,
	message: string,
	status = 400,
): NextResponse<ApiError> {
	return NextResponse.json({ error: { code, message } }, { status });
}

// ─── Auth resolution ──────────────────────────────────────────────────────────

export interface AuthContext {
	organizationId: string;
	tier: PlanTier;
}

/**
 * Resolves authentication from the Bearer token.
 * Returns an AuthContext on success, or a NextResponse error to return early.
 *
 * Usage:
 * ```ts
 * const ctx = await resolveApiAuth();
 * if (ctx instanceof NextResponse) return ctx;
 * ```
 */
export async function resolveApiAuth(): Promise<
	AuthContext | NextResponse<ApiError>
> {
	const hdrs = await headers();
	const authorization = hdrs.get("authorization") ?? "";
	const token = authorization.startsWith("Bearer ")
		? authorization.slice(7)
		: null;

	if (!token) {
		return apiErr("UNAUTHORIZED", "Missing Authorization header.", 401);
	}

	// Verify the API key via BetterAuth
	let keyVerification: Awaited<
		ReturnType<typeof auth.api.verifyApiKey>
	> | null = null;
	try {
		keyVerification = await auth.api.verifyApiKey({
			body: { key: token },
		});
	} catch {
		return apiErr("UNAUTHORIZED", "Invalid or expired API key.", 401);
	}

	if (!keyVerification?.valid) {
		return apiErr("UNAUTHORIZED", "Invalid or expired API key.", 401);
	}

	// Resolve org from the key's referenceId
	const organizationId = keyVerification.key?.referenceId;
	if (!organizationId) {
		return apiErr(
			"FORBIDDEN",
			"This API key is not associated with an organisation.",
			403,
		);
	}

	// Load subscription to determine tier
	const subscription = await prisma.subscription.findUnique({
		where: { organizationId },
		select: { productId: true },
	});

	const tier = getTier(subscription?.productId);

	return { organizationId, tier };
}

// ─── Entitlement checks ───────────────────────────────────────────────────────

/**
 * Checks if the org has exceeded the monthly lead routing limit.
 */
export async function checkLeadLimit(
	organizationId: string,
	tier: PlanTier,
): Promise<NextResponse<ApiError> | null> {
	const limit = PLAN_LIMITS[tier].monthly_leads;
	if (limit === Infinity) return null;

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const count = await prisma.routingLog.count({
		where: {
			organizationId,
			assignedAt: { gte: monthStart },
		},
	});

	if (count >= limit) {
		return apiErr(
			"LEAD_LIMIT_EXCEEDED",
			`Your plan allows ${limit.toLocaleString()} leads/month. Upgrade to Pro for unlimited routing.`,
			402,
		);
	}
	return null;
}

/**
 * Checks if the org has exceeded the rep limit.
 */
export async function checkRepLimit(
	organizationId: string,
	tier: PlanTier,
): Promise<NextResponse<ApiError> | null> {
	const limit = PLAN_LIMITS[tier].reps;
	if (limit === Infinity) return null;

	const count = await prisma.rep.count({ where: { organizationId } });
	if (count >= limit) {
		return apiErr(
			"REP_LIMIT_EXCEEDED",
			`Your plan allows ${limit} reps. Upgrade to Pro for unlimited reps.`,
			402,
		);
	}
	return null;
}

/**
 * Checks if the org has exceeded the ruleset limit.
 */
export async function checkRulesetLimit(
	organizationId: string,
	tier: PlanTier,
	rulesetId?: string,
): Promise<NextResponse<ApiError> | null> {
	const limit = PLAN_LIMITS[tier].rulesets;
	if (limit === Infinity) return null;

	if (rulesetId) {
		const existingRuleset = await prisma.ruleset.findFirst({
			where: { organizationId, rulesetId, deletedAt: null },
			select: { id: true },
		});
		if (existingRuleset) return null;
	}

	const count = await prisma.ruleset.count({
		where: { organizationId, deletedAt: null },
	});
	if (count >= limit) {
		return apiErr(
			"RULESET_LIMIT_EXCEEDED",
			`Your plan allows ${limit} ruleset. Upgrade to Pro for unlimited rulesets.`,
			402,
		);
	}
	return null;
}

/**
 * Translates known domain error codes into NextResponse errors.
 */
export function domainError(
	err: unknown,
	fallbackStatus = 500,
): NextResponse<ApiError> {
	if (err instanceof Error && "code" in err) {
		const e = err as Error & { code: string };
		const map: Record<string, [number, string]> = {
			RULESET_NOT_FOUND: [404, e.message],
			REP_NOT_FOUND: [404, e.message],
			CONTACT_NOT_FOUND: [404, e.message],
			DUPLICATE_REP_ID: [409, e.message],
			OVERFLOW_OOO: [409, e.message],
			NO_REP_AVAILABLE: [422, e.message],
		};
		const mapped = map[e.code];
		if (mapped) return apiErr(e.code, mapped[1], mapped[0]);
	}
	const message =
		err instanceof Error ? err.message : "An unexpected error occurred.";
	return apiErr("INTERNAL_ERROR", message, fallbackStatus);
}
