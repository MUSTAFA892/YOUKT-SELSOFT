# Table: requisition_approval_actions

## Metadata

- Primary key: id
- Total columns: 11

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| request_id | uuid | NO | NO | YES |
| step_id | uuid | YES | NO | NO |
| approver_user_id | uuid | YES | NO | NO |
| approver_email | text | YES | NO | NO |
| action | public.approval_action_type | NO | NO | YES |
|  | Enum Values | approve, reject, comment, request_changes |  |  |
| comment | text | YES | NO | NO |
| action_token | uuid | NO | YES | NO |
| metadata | jsonb | NO | YES | NO |
| action_at | timestamptz | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "requisition_approval_actions",
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
    "table": "requisition_approval_actions",
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
