# Table: applications

## Metadata

- Primary key: id
- Total columns: 9

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| candidate_id | uuid | NO | NO | YES |
| requisition_id | uuid | NO | NO | YES |
| status | public.application_status | NO | YES | NO |
|  | Enum Values | submitted, under_review, shortlisted, interview_scheduled, interviewing, offer_pending, offered, hired, rejected, withdrawn |  |  |
| source_distribution_id | uuid | YES | NO | NO |
| ai_score | numeric(5,2) | YES | NO | NO |
| ai_summary | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "applications",
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
    "table": "applications",
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
