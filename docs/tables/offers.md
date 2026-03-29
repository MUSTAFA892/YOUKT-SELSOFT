# Table: offers

## Metadata

- Primary key: id
- Total columns: 16

## Columns

| Column | Type | Nullable | Has Default | Required on Insert |
|---|---|---|---|---|
| id | uuid | NO | YES | NO |
| application_id | uuid | NO | NO | YES |
| created_by | uuid | YES | NO | NO |
| status | public.offer_status | NO | YES | NO |
|  | Enum Values | draft, pending_approval, sent, accepted, rejected, expired, withdrawn |  |  |
| currency_code | char(3) | NO | YES | NO |
| base_salary | numeric(12,2) | YES | NO | NO |
| bonus_amount | numeric(12,2) | YES | NO | NO |
| equity_text | text | YES | NO | NO |
| start_date | date | YES | NO | NO |
| expiration_date | date | YES | NO | NO |
| terms_text | text | YES | NO | NO |
| sent_at | timestamptz | YES | NO | NO |
| responded_at | timestamptz | YES | NO | NO |
| response_note | text | YES | NO | NO |
| created_at | timestamptz | NO | YES | NO |
| updated_at | timestamptz | NO | YES | NO |

## Request Example

```json
{
  "table": "offers",
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
    "table": "offers",
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
