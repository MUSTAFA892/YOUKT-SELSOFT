# Table: interview_participants

## Metadata

- Primary key: id
- Total columns: 8

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| interview_id | uuid | NO | NO | YES |
| user_id | uuid | YES | NO | NO |
| participant_name | text | YES | NO | NO |
| participant_email | text | YES | NO | NO |
| participant_role | text | NO | NO | YES |
| response_status | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "interview_participants",
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
    "table": "interview_participants",
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
