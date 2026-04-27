"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const ACTIVITY_TYPES = [
	"email_sent",
	"email_received",
	"call_completed",
	"call_attempted",
	"meeting_completed",
	"meeting_scheduled",
	"demo_completed",
	"note_added",
	"linkedin_message",
	"custom",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface CreateContactInput {
	contact_id: string;
	email: string;
	name?: string;
	lead_id?: string;
}

export interface LogActivityInput {
	activity_type: ActivityType;
	timestamp: string; // ISO string
	rep_id?: string;
	duration_minutes?: number;
	outcome?: string;
	notes?: string;
	subject?: string;
	meeting_time?: string;
	metadata?: Record<string, unknown>;
}

const activitySelect = {
	id: true,
	activityType: true,
	timestamp: true,
	repId: true,
	durationMinutes: true,
	outcome: true,
	notes: true,
	subject: true,
	meetingTime: true,
	createdAt: true,
} satisfies Prisma.ActivitySelect;

/**
 * Creates a contact or returns the existing one (idempotent by contact_id).
 */
export async function upsertContact(
	organizationId: string,
	data: CreateContactInput,
): Promise<{ id: string; contactId: string; email: string; name: string | null; createdAt: Date; exists: boolean }> {
	const existing = await prisma.contact.findUnique({
		where: {
			organizationId_contactId: {
				organizationId,
				contactId: data.contact_id,
			},
		},
		select: { id: true, contactId: true, email: true, name: true, createdAt: true },
	});

	if (existing) {
		return { ...existing, exists: true };
	}

	const created = await prisma.contact.create({
		data: {
			organizationId,
			contactId: data.contact_id,
			email: data.email,
			name: data.name,
			leadId: data.lead_id,
		},
		select: { id: true, contactId: true, email: true, name: true, createdAt: true },
	});

	return { ...created, exists: false };
}

/**
 * Logs an activity against a contact.
 * Idempotent: if the same (contactId, activityType, timestamp) already exists,
 * returns the original record with deduplicated: true.
 *
 * @throws {Error} with code "CONTACT_NOT_FOUND" if contact_id not found in org
 */
export async function logActivity(
	organizationId: string,
	contactCustomId: string,
	data: LogActivityInput,
): Promise<{ id: string; deduplicated: boolean }> {
	const contact = await prisma.contact.findUnique({
		where: {
			organizationId_contactId: {
				organizationId,
				contactId: contactCustomId,
			},
		},
	});

	if (!contact) {
		const err = new Error(`Contact '${contactCustomId}' not found`) as Error & {
			code: string;
		};
		err.code = "CONTACT_NOT_FOUND";
		throw err;
	}

	const timestamp = new Date(data.timestamp);

	// Resolve rep DB id
	let repDbId: string | null = null;
	if (data.rep_id) {
		const rep = await prisma.rep.findUnique({
			where: {
				organizationId_repId: { organizationId, repId: data.rep_id },
			},
			select: { id: true },
		});
		repDbId = rep?.id ?? null;
	}

	// Check for duplicate
	const existing = await prisma.activity.findUnique({
		where: {
			contactId_activityType_timestamp: {
				contactId: contact.id,
				activityType: data.activity_type,
				timestamp,
			},
		},
		select: { id: true },
	});

	if (existing) {
		return { id: existing.id, deduplicated: true };
	}

	const created = await prisma.activity.create({
		data: {
			organizationId,
			contactId: contact.id,
			activityType: data.activity_type,
			timestamp,
			repId: repDbId,
			durationMinutes: data.duration_minutes,
			outcome: data.outcome,
			notes: data.notes,
			subject: data.subject,
			meetingTime: data.meeting_time ? new Date(data.meeting_time) : null,
			metadataJson: data.metadata ? JSON.stringify(data.metadata) : null,
		},
		select: { id: true },
	});

	return { id: created.id, deduplicated: false };
}

export interface ActivitySummary {
	total_touches: number;
	last_activity_at: string | null;
	days_since_last_activity: number | null;
	first_response_time_minutes: number | null;
	has_meeting_booked: boolean;
	engagement_status: "active" | "stale" | "cold";
}

/**
 * Returns the activity feed for a contact with a computed summary.
 *
 * @throws {Error} with code "CONTACT_NOT_FOUND" if contact_id not found in org
 */
export async function getContactActivities(
	organizationId: string,
	contactCustomId: string,
	filters: { limit?: number; offset?: number; activity_type?: string },
): Promise<{
	contact_id: string;
	lead_id: string | null;
	assigned_rep: string | null;
	activities: Prisma.ActivityGetPayload<{ select: typeof activitySelect }>[];
	summary: ActivitySummary;
}> {
	const contact = await prisma.contact.findUnique({
		where: {
			organizationId_contactId: {
				organizationId,
				contactId: contactCustomId,
			},
		},
	});

	if (!contact) {
		const err = new Error(`Contact '${contactCustomId}' not found`) as Error & {
			code: string;
		};
		err.code = "CONTACT_NOT_FOUND";
		throw err;
	}

	const where: Prisma.ActivityWhereInput = { contactId: contact.id };
	if (filters.activity_type) where.activityType = filters.activity_type;

	const activities = await prisma.activity.findMany({
		where,
		select: activitySelect,
		orderBy: { timestamp: "asc" },
		take: filters.limit ?? 50,
		skip: filters.offset ?? 0,
	});

	// Compute summary
	const summary = computeActivitySummary(activities, contact);

	// Resolve assigned rep name
	let assignedRep: string | null = null;
	if (contact.assignedRepId) {
		const rep = await prisma.rep.findFirst({
			where: { organizationId, repId: contact.assignedRepId },
			select: { name: true },
		});
		assignedRep = rep?.name ?? contact.assignedRepId;
	}

	return {
		contact_id: contact.contactId,
		lead_id: contact.leadId,
		assigned_rep: assignedRep,
		activities,
		summary,
	};
}

/**
 * Computes the activity summary for a contact.
 */
function computeActivitySummary(
	activities: Prisma.ActivityGetPayload<{ select: typeof activitySelect }>[],
	contact: { createdAt: Date },
): ActivitySummary {
	const now = new Date();
	const totalTouches = activities.length;

	if (totalTouches === 0) {
		const daysSinceCreation = Math.floor(
			(now.getTime() - contact.createdAt.getTime()) / (1000 * 60 * 60 * 24),
		);
		return {
			total_touches: 0,
			last_activity_at: null,
			days_since_last_activity: null,
			first_response_time_minutes: null,
			has_meeting_booked: false,
			engagement_status: daysSinceCreation > 7 ? "cold" : "stale",
		};
	}

	const sorted = [...activities].sort(
		(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
	);
	const lastActivity = sorted[sorted.length - 1];
	const daysSinceLast = Math.floor(
		(now.getTime() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24),
	);

	// First response: first email_sent, call_completed, or meeting_scheduled
	const responseTypes = new Set(["email_sent", "call_completed", "meeting_scheduled"]);
	const firstResponse = sorted.find((a) => responseTypes.has(a.activityType));
	const firstResponseTimeMinutes = firstResponse
		? Math.round(
				(firstResponse.timestamp.getTime() - contact.createdAt.getTime()) /
					(1000 * 60),
			)
		: null;

	const hasMeetingBooked = activities.some(
		(a) =>
			a.activityType === "meeting_scheduled" ||
			a.activityType === "meeting_completed" ||
			a.activityType === "demo_completed",
	);

	let engagementStatus: "active" | "stale" | "cold";
	if (daysSinceLast <= 2) engagementStatus = "active";
	else if (daysSinceLast <= 14) engagementStatus = "stale";
	else engagementStatus = "cold";

	return {
		total_touches: totalTouches,
		last_activity_at: lastActivity.timestamp.toISOString(),
		days_since_last_activity: daysSinceLast,
		first_response_time_minutes: firstResponseTimeMinutes,
		has_meeting_booked: hasMeetingBooked,
		engagement_status: engagementStatus,
	};
}
