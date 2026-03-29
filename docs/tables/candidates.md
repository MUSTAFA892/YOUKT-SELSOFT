# Table: candidates

## Metadata

- Primary key: id
- Total columns: 12

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| user_id | uuid | YES | NO | NO |
| email | text | NO | NO | YES |
| first_name | text | NO | NO | YES |
| last_name | text | NO | NO | YES |
| phone | text | YES | NO | NO |
| current_location | text | YES | NO | NO |
| headline | text | YES | NO | NO |
| summary | text | YES | NO | NO |
| resume_url | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "candidates",
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
    "table": "candidates",
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
