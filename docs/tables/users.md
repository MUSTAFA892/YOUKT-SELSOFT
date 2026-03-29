# Table: users

## Metadata

- Primary key: id
- Total columns: 13

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| email | text | NO | NO | YES |
| password_hash | text | YES | NO | NO |
| auth_provider | text | NO | YES | NO |
| auth_provider_id | text | YES | NO | NO |
| role_id | uuid | YES | NO | NO |
| first_name | text | YES | NO | NO |
| last_name | text | YES | NO | NO |
| department | text | YES | NO | NO |
| is_active | boolean | NO | YES | NO |
| last_login | timestamptz | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "users",
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
    "table": "users",
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
