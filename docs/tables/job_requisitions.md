# Table: job_requisitions

## Metadata

- Primary key: id
- Total columns: 32

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| creator_id | uuid | NO | NO | YES |
| template_id | uuid | YES | NO | NO |
| duplicated_from_requisition_id | uuid | YES | NO | NO |
| approval_workflow_id | uuid | YES | NO | NO |
| title | text | NO | NO | YES |
| department | text | NO | NO | YES |
| location | public.location_type | NO | NO | YES |
|  | Enum Values | remote, hybrid, onsite |  |  |
| job_type | public.employment_type | NO | NO | YES |
|  | Enum Values | full-time, part-time, contract, internship |  |  |
| experience | public.experience_level | NO | NO | YES |
|  | Enum Values | entry, mid, senior, lead, executive |  |  |
| positions_count | integer | NO | YES | NO |
| salary_range_min | numeric(12,2) | YES | NO | NO |
| salary_range_max | numeric(12,2) | YES | NO | NO |
| is_salary_hidden | boolean | NO | YES | NO |
| description | text | NO | NO | YES |
| required_skills | text[] | NO | YES | NO |
| preferred_skills | text[] | NO | YES | NO |
| education_reqs | text | YES | NO | NO |
| certifications | text | YES | NO | NO |
| priority | public.priority_level | NO | YES | NO |
|  | Enum Values | low, medium, high, urgent |  |  |
| expected_start_date | date | YES | NO | NO |
| application_deadline | date | YES | NO | NO |
| custom_fields | jsonb | NO | YES | NO |
| state | public.requisition_state | NO | YES | NO |
|  | Enum Values | draft, pending_approval, approved, rejected, active, on_hold, closed, archived |  |  |
| is_locked | boolean | NO | YES | NO |
| locked_at | timestamptz | YES | NO | NO |
| approval_requested_at | timestamptz | YES | NO | NO |
| approved_at | timestamptz | YES | NO | NO |
| rejected_at | timestamptz | YES | NO | NO |
| parent_version_id | uuid | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "job_requisitions",
  "action": "select",
  "payload": {
    "columns": [
      "*"
    ],
    "limit": 20,
    "offset": 0,
    "orderBy": [
      {
        "field": "id",
        "direction": "desc"
      }
    ]
  }
}
```

## Response Example

```json
{
  "ok": true,
  "data": {
    "table": "job_requisitions",
    "action": "select",
    "rows": [],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 0
    }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```
