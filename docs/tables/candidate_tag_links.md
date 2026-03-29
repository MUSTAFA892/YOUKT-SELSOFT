# Table: candidate_tag_links

## Metadata

- Primary key: id
- Total columns: 4

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| candidate_id | uuid | NO | NO | YES |
| tag_id | uuid | NO | NO | YES |
| created_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "candidate_tag_links",
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
    "table": "candidate_tag_links",
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
