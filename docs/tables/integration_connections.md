# Table: integration_connections

## Metadata

- Primary key: id
- Total columns: 9

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| platform | text | NO | NO | YES |
| display_name | text | YES | NO | NO |
| is_enabled | boolean | NO | YES | NO |
| settings | jsonb | NO | YES | NO |
| credentials_reference | text | YES | NO | NO |
| last_synced_at | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "integration_connections",
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
    "table": "integration_connections",
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
