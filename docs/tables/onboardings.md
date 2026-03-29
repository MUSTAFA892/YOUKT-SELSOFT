# Table: onboardings

## Metadata

- Primary key: id
- Total columns: 10

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| offer_id | uuid | NO | NO | YES |
| workflow_id | uuid | YES | NO | NO |
| user_id | uuid | YES | NO | NO |
| status | public.onboarding_status | NO | YES | NO |
|  | Enum Values | not_started, in_progress, completed, blocked, cancelled |  |  |
| start_date | date | YES | NO | NO |
| target_completion_date | date | YES | NO | NO |
| completed_at | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "onboardings",
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
    "table": "onboardings",
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
