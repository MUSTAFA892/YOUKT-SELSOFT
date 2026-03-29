# Table: requisition_state_history

## Metadata

- Primary key: id
- Total columns: 7

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| requisition_id | uuid | NO | NO | YES |
| from_state | public.requisition_state | YES | NO | NO |
|  | Enum Values | draft, pending_approval, approved, rejected, active, on_hold, closed, archived |  |  |
| to_state | public.requisition_state | NO | NO | YES |
|  | Enum Values | draft, pending_approval, approved, rejected, active, on_hold, closed, archived |  |  |
| changed_by | uuid | YES | NO | NO |
| reason | text | YES | NO | NO |
| changed_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "requisition_state_history",
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
    "table": "requisition_state_history",
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
