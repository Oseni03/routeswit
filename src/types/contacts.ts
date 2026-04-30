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

export interface ActivitySummary {
	total_touches: number;
	last_activity_at: string | null;
	days_since_last_activity: number | null;
	first_response_time_minutes: number | null;
	has_meeting_booked: boolean;
	engagement_status: "active" | "stale" | "cold";
}
