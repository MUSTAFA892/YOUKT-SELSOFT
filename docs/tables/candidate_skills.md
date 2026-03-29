# Table: candidate_skills

## Metadata

- Primary key: id
- Total columns: 6

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| candidate_id | uuid | NO | NO | YES |
| skill_name | text | NO | NO | YES |
| years_experience | numeric(4,1) | YES | NO | NO |
| is_preferred | boolean | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "candidate_skills",
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
    "table": "candidate_skills",
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
