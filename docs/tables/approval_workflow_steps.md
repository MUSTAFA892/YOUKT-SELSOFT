# Table: approval_workflow_steps

## Metadata

- Primary key: id
- Total columns: 8

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| workflow_id | uuid | NO | NO | YES |
| step_order | integer | NO | NO | YES |
| approver_role_id | uuid | YES | NO | NO |
| approver_user_id | uuid | YES | NO | NO |
| approver_email | text | YES | NO | NO |
| is_required | boolean | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "approval_workflow_steps",
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
    "table": "approval_workflow_steps",
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
