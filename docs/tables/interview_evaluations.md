# Table: interview_evaluations

## Metadata

- Primary key: id
- Total columns: 13

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| interview_id | uuid | NO | NO | YES |
| evaluator_user_id | uuid | YES | NO | NO |
| evaluator_name | text | YES | NO | NO |
| evaluator_email | text | YES | NO | NO |
| score | numeric(5,2) | YES | NO | NO |
| recommendation | text | YES | NO | NO |
| strengths | text | YES | NO | NO |
| concerns | text | YES | NO | NO |
| feedback | jsonb | NO | YES | NO |
| submitted_at | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "interview_evaluations",
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
    "table": "interview_evaluations",
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
