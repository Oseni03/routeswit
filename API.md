# Routeswit API v1 Documentation

The Routeswit API provides a programmatic interface to manage lead routing, sales representatives, routing rules, and analytics for your organization.

## Base URL

All API requests are made to:
`https://app.routeswit.com/api/v1`

Your organization context is automatically resolved from the API key used for the request.

---

## Authentication

Routeswit uses API keys to authenticate requests. You can generate and manage API keys in your **Settings > API Keys** dashboard.

Include your API key in the `Authorization` header of all requests:

```http
Authorization: Bearer sk_...
```

> [!WARNING]
> Your API keys carry significant privileges. Keep them secure and never expose them in client-side code or public repositories.

---

## Error Handling

Routeswit uses standard HTTP response codes to indicate the success or failure of an API request. In general:
- `2xx` codes indicate success.
- `4xx` codes indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.).
- `5xx` codes indicate an error with Routeswit's servers.

### Error Response Format

All error responses return a JSON object with the following structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable explanation of the error."
  }
}
```

### Common Error Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `BAD_REQUEST` | 400 | The request was unacceptable, often due to missing a required parameter or invalid JSON. |
| `UNAUTHORIZED` | 401 | No valid API key was provided. |
| `FORBIDDEN` | 403 | The API key is valid but does not have permission to access the resource or organization. |
| `NOT_FOUND` | 404 | The requested resource does not exist. |
| `VALIDATION_ERROR` | 422 | The request parameters were invalid (e.g., failed Zod schema validation). |
| `LEAD_LIMIT_EXCEEDED` | 402 | Your organization has reached its monthly lead routing limit. |
| `REP_LIMIT_EXCEEDED` | 402 | Your organization has reached its representative limit. |
| `RULESET_LIMIT_EXCEEDED` | 402 | Your organization has reached its ruleset limit. |
| `INTERNAL_ERROR` | 500 | Something went wrong on Routeswit's end. |

---

## Leads

### Route a Lead
`POST /leads`

Routes a lead through a specified ruleset. If no rules match, the lead is assigned to the fallback queue.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `lead_id` | string | Yes | A unique identifier for the lead in your system. |
| `ruleset_id` | string | Yes | The ID of the ruleset to evaluate against. |
| `attributes` | object | Yes | Key-value pairs representing lead data (e.g., industry, company size) used for rule matching. |

**Example Request**
```bash
curl -X POST https://app.routeswit.com/api/v1/leads \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "lead_98765",
    "ruleset_id": "us-sales",
    "attributes": {
      "state": "CA",
      "company_size": 500,
      "industry": "Technology"
    }
  }'
```

**Response (200 OK)**
```json
{
  "data": {
    "lead_id": "lead_98765",
    "assigned_to": {
      "rep_id": "rep_jane_doe",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "current_load": 12
    },
    "rule_matched": "Enterprise West",
    "rule_priority": 1,
    "assignment_method": "round_robin",
    "assigned_at": "2024-04-29T12:00:00Z",
    "fallback_used": false
  }
}
```

---

## Representatives (Reps)

### List Reps
`GET /reps`

Returns a list of all representatives configured for your organization.

### Create a Rep
`POST /reps`

Adds a new representative to your routing system.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `rep_id` | string | Yes | Unique ID for the rep. Must be alphanumeric, hyphens, or underscores. |
| `name` | string | Yes | The representative's full name. |
| `email` | string | Yes | The representative's email address. |
| `timezone` | string | No | The representative's primary timezone (e.g., "America/New_York"). |

### Update a Rep
`PATCH /reps/[rep_id]`

Updates a representative's status or availability.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | string | No | One of: `active`, `ooo` (Out of Office), `inactive`. |
| `ooo_until` | string | No | ISO8601 timestamp for when OOO status expires. |
| `overflow_to` | string | No | `rep_id` to route leads to while this rep is OOO. |

### Get Rep Load
`GET /reps/[rep_id]/load`

Returns the current load (number of active leads) and performance metrics for a specific representative.

---

## Rulesets

### List Rulesets
`GET /rules`

Returns a list of all active rulesets for your organization.

### Create or Replace Ruleset
`POST /rules`

Creates a new ruleset or completely replaces an existing one if the `ruleset_id` matches.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ruleset_id` | string | Yes | Unique identifier for the ruleset. |
| `name` | string | Yes | Human-readable name for the ruleset. |
| `rules` | array | Yes | List of routing rules ordered by priority. |
| `fallback` | object | Yes | Configuration for leads that match no rules (e.g., `{"type": "queue", "queue_id": "general"}`). |

### Delete Ruleset
`DELETE /rules/[ruleset_id]`

Soft-deletes a ruleset. This stops further routing through this ruleset but preserves historical routing logs.

---

---

## Contacts & Activities

Manage persistent contact data and interaction history. This allows for long-term tracking of lead engagement beyond the initial routing event.

### Upsert Contact
`POST /contacts`

Creates a contact record or returns the existing one if the `contact_id` is already known. Use this to sync your CRM's contact state with Routeswit.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `contact_id` | string | Yes | Unique ID for the contact (e.g., from your CRM). |
| `email` | string | No | Contact's email address. |
| `name` | string | No | Contact's full name. |

---

### List Activities
`GET /contacts/[contact_id]/activities`

Returns a chronological feed of all activities logged against a contact.

---

### Log Activity
`POST /contacts/[contact_id]/activities`

Records a sales activity (email, call, meeting) against a contact. This data is critical for SLA tracking and "stale lead" alerting.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `activity_type` | string | Yes | One of: `call`, `email`, `meeting`, `note`. |
| `notes` | string | No | Text description or transcription of the activity. |
| `timestamp` | string | No | ISO8601 timestamp. Defaults to current time. |

**Example Request**
```json
{
  "activity_type": "call",
  "notes": "Discussed Q3 budget requirements.",
  "timestamp": "2024-04-29T14:30:00Z"
}
```

---

## Analytics & Alerts

Monitor performance metrics and configure automated response systems.

### Analytics Summary
`GET /analytics/summary`

Returns aggregate routing metrics for your organization. You can filter by period using the `month` query parameter (format: `YYYY-MM`).

**Query Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `month` | string | No | The month to retrieve metrics for (e.g., `2024-04`). |

---

### Configure Stale Alert
`POST /alerts/stale`

Sets up thresholds for lead inactivity. If a lead receives no activity within the specified hours, Routeswit can trigger a webhook or send an internal notification.

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ruleset_id` | string | Yes | The ruleset this alert configuration applies to. |
| `hours_threshold` | number | Yes | Number of hours of inactivity before an alert is fired. |
| `webhook_url` | string | No | URL to send the alert payload to. |

---

### Configure SLA
`POST /slas`

Defines target response times for leads. 

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Name of the SLA policy (e.g., "Enterprise Response"). |
| `target_minutes` | number | Yes | The maximum time allowed before an SLA breach. |
| `ruleset_id` | string | No | Apply this SLA only to a specific ruleset. |
