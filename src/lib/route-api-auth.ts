/**
 * Shared helper for Route API v1 route handlers.
 *
 * Responsibilities:
 *  1. Verify the `Authorization: Bearer sk_…` API key via BetterAuth
 *  2. Resolve the organisation the key belongs to
 *  3. Return standard error responses in { error: { code, message } } shape
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

	return { organizationId };
}

// ─── Translators ──────────────────────────────────────────────────────────────

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
