# Table: candidate_notes

## Metadata

- Primary key: id
- Total columns: 7

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| candidate_id | uuid | NO | NO | YES |
| author_user_id | uuid | YES | NO | NO |
| note | text | NO | NO | YES |
| is_private | boolean | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "candidate_notes",
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
    "table": "candidate_notes",
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
