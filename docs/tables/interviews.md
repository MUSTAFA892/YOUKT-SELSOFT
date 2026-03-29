# Table: interviews

## Metadata

- Primary key: id
- Total columns: 14

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| application_id | uuid | NO | NO | YES |
| stage_name | text | NO | NO | YES |
| interview_type | public.interview_type | NO | NO | YES |
|  | Enum Values | phone, video, onsite, panel, technical, hr |  |  |
| status | public.interview_status | NO | YES | NO |
|  | Enum Values | scheduled, completed, cancelled, no_show |  |  |
| scheduled_start | timestamptz | NO | NO | YES |
| scheduled_end | timestamptz | NO | NO | YES |
| timezone | text | YES | NO | NO |
| meeting_url | text | YES | NO | NO |
| location_details | text | YES | NO | NO |
| created_by | uuid | YES | NO | NO |
| notes | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "interviews",
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
    "table": "interviews",
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
