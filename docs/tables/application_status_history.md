# Table: application_status_history

## Metadata

- Primary key: id
- Total columns: 7

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| application_id | uuid | NO | NO | YES |
| from_status | public.application_status | YES | NO | NO |
|  | Enum Values | submitted, under_review, shortlisted, interview_scheduled, interviewing, offer_pending, offered, hired, rejected, withdrawn |  |  |
| to_status | public.application_status | NO | NO | YES |
|  | Enum Values | submitted, under_review, shortlisted, interview_scheduled, interviewing, offer_pending, offered, hired, rejected, withdrawn |  |  |
| changed_by | uuid | YES | NO | NO |
| reason | text | YES | NO | NO |
| changed_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "application_status_history",
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
    "table": "application_status_history",
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
