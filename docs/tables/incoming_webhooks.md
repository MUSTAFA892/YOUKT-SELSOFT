# Table: incoming_webhooks

## Metadata

- Primary key: id
- Total columns: 7

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| source_platform | text | NO | NO | YES |
| payload | jsonb | NO | NO | YES |
| processed | boolean | NO | YES | NO |
| processing_error | text | YES | NO | NO |
| processed_at | timestamptz | YES | NO | NO |
| received_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "incoming_webhooks",
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
    "table": "incoming_webhooks",
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
