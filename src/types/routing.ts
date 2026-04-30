export type ConditionOperator =
    | "eq"
    | "gte"
    | "lte"
    | "gt"
    | "lt"
    | "in"
    | "not_in"
    | "between";

export interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: unknown;
}

export interface SpecificRepAssignment {
    type: "specific_rep";
    rep_id: string;
}

export interface RoundRobinAssignment {
    type: "round_robin";
    pool: string[];
    method: "equal_distribution";
}

export interface TerritoryAssignment {
    type: "territory";
    territory_field: string;
    territory_map: Record<string, string[]>;
}

export type AssignmentConfig =
    | SpecificRepAssignment
    | RoundRobinAssignment
    | TerritoryAssignment;

export interface RoutingRule {
    priority: number;
    name: string;
    conditions: RuleCondition[];
    assignment: AssignmentConfig;
}

export interface FallbackConfig {
    type: "queue";
    queue_id: string;
}

export interface RulesetData {
    ruleset_id: string;
    name: string;
    rules: RoutingRule[];
    fallback: FallbackConfig;
}

export interface RouteLeadResult {
    lead_id: string;
    assigned_to: {
        rep_id: string;
        name: string;
        email: string;
        current_load: number;
    };
    rule_matched: string | null;
    rule_priority: number | null;
    assignment_method: string;
    round_robin_position: number | null;
    assigned_at: string;
    fallback_used: boolean;
}