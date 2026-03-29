# Table: ai_screening_runs

## Metadata

- Primary key: id
- Total columns: 13

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| application_id | uuid | NO | NO | YES |
| status | public.screening_status | NO | YES | NO |
|  | Enum Values | pending, processing, completed, failed |  |  |
| model_name | text | YES | NO | NO |
| model_version | text | YES | NO | NO |
| score | numeric(5,2) | YES | NO | NO |
| summary | text | YES | NO | NO |
| strengths | text[] | NO | YES | NO |
| risks | text[] | NO | YES | NO |
| raw_response | jsonb | NO | YES | NO |
| started_at | timestamptz | YES | NO | NO |
| completed_at | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "ai_screening_runs",
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
    "table": "ai_screening_runs",
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
