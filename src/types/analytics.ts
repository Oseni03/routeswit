export interface AnalyticsPeriod {
    year: number;
    month: number; // 1-12
}

export interface RepDistribution {
    rep_id: string;
    leads_assigned: number;
    avg_first_response_minutes: number | null;
    sla_met_rate: number | null;
    meetings_booked: number;
    meeting_rate: number;
}

export interface SpeedToLead {
    median_minutes: number;
    p90_minutes: number;
    sla_target_minutes: number;
    sla_met_rate: number;
}