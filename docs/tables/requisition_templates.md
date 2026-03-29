# Table: requisition_templates

## Metadata

- Primary key: id
- Total columns: 24

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| name | text | NO | NO | YES |
| description | text | YES | NO | NO |
| created_by | uuid | YES | NO | NO |
| is_predefined | boolean | NO | YES | NO |
| is_active | boolean | NO | YES | NO |
| title | text | YES | NO | NO |
| department | text | YES | NO | NO |
| location | public.location_type | YES | NO | NO |
|  | Enum Values | remote, hybrid, onsite |  |  |
| job_type | public.employment_type | YES | NO | NO |
|  | Enum Values | full-time, part-time, contract, internship |  |  |
| experience | public.experience_level | YES | NO | NO |
|  | Enum Values | entry, mid, senior, lead, executive |  |  |
| positions_count | integer | YES | NO | NO |
| salary_range_min | numeric(12,2) | YES | NO | NO |
| salary_range_max | numeric(12,2) | YES | NO | NO |
| is_salary_hidden | boolean | NO | YES | NO |
| description_rich_text | text | YES | NO | NO |
| required_skills | text[] | NO | YES | NO |
| preferred_skills | text[] | NO | YES | NO |
| education_reqs | text | YES | NO | NO |
| certifications | text | YES | NO | NO |
| priority | public.priority_level | YES | NO | NO |
|  | Enum Values | low, medium, high, urgent |  |  |
| template_payload | jsonb | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "requisition_templates",
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
    "table": "requisition_templates",
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
