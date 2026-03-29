# Table: onboarding_tasks

## Metadata

- Primary key: id
- Total columns: 11

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| onboarding_id | uuid | NO | NO | YES |
| workflow_task_id | uuid | YES | NO | NO |
| task_name | text | NO | NO | YES |
| assignee_user_id | uuid | YES | NO | NO |
| status | public.onboarding_status | NO | YES | NO |
|  | Enum Values | not_started, in_progress, completed, blocked, cancelled |  |  |
| due_date | date | YES | NO | NO |
| completed_at | timestamptz | YES | NO | NO |
| notes | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "onboarding_tasks",
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
    "table": "onboarding_tasks",
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
