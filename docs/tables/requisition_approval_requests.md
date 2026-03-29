# Table: requisition_approval_requests

## Metadata

- Primary key: id
- Total columns: 10

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| requisition_id | uuid | NO | NO | YES |
| workflow_id | uuid | YES | NO | NO |
| requested_by | uuid | YES | NO | NO |
| status | public.approval_request_status | NO | YES | NO |
|  | Enum Values | pending, approved, rejected, cancelled |  |  |
| request_message | text | YES | NO | NO |
| requested_at | timestamptz | NO | YES | NO |
| resolved_at | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "requisition_approval_requests",
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
    "table": "requisition_approval_requests",
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
