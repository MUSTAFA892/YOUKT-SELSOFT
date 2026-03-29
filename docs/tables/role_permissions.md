# Table: role_permissions

## Metadata

- Primary key: id
- Total columns: 4

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| role_id | uuid | NO | NO | YES |
| permission_id | uuid | NO | NO | YES |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "role_permissions",
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
    "table": "role_permissions",
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
