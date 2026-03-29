# Table: job_distributions

## Metadata

- Primary key: id
- Total columns: 20

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| requisition_id | uuid | NO | NO | YES |
| integration_connection_id | uuid | YES | NO | NO |
| platform | text | NO | NO | YES |
| status | public.sync_status | NO | YES | NO |
|  | Enum Values | pending, processing, published, failed, expired |  |  |
| publish_mode | public.publish_mode | NO | YES | NO |
|  | Enum Values | automatic, manual, scheduled, recurring |  |  |
| scheduled_for | timestamptz | YES | NO | NO |
| recurrence_interval | interval | YES | NO | NO |
| next_repost_at | timestamptz | YES | NO | NO |
| published_at | timestamptz | YES | NO | NO |
| location_override | text | YES | NO | NO |
| external_job_id | text | YES | NO | NO |
| posting_url | text | YES | NO | NO |
| tracking_link | text | YES | NO | NO |
| custom_messaging | text | YES | NO | NO |
| media_assets | text[] | NO | YES | NO |
| channel_metadata | jsonb | NO | YES | NO |
| sync_logs | jsonb | NO | YES | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "job_distributions",
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
    "table": "job_distributions",
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
