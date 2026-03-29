# Table: onboarding_workflow_tasks

## Metadata

- Primary key: id
- Total columns: 10

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| workflow_id | uuid | NO | NO | YES |
| task_name | text | NO | NO | YES |
| task_description | text | YES | NO | NO |
| sort_order | integer | NO | NO | YES |
| default_owner_role_id | uuid | YES | NO | NO |
| due_days_after_start | integer | YES | NO | NO |
| is_required | boolean | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "onboarding_workflow_tasks",
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
    "table": "onboarding_workflow_tasks",
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
