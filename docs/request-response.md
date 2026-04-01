# Gateway Request and Response Format

All data operations use one endpoint:

- Method: POST
- URL: /api/v1/data
- Content-Type: application/json

## Request Body

```json
{
  "table": "<table_name>",
  "action": "select|insert|update|delete|upsert",
  "payload": {}
}
```

## Authentication

The gateway supports two authentication methods:

- API key: set `x-api-key` header to the shared key (if configured).
- Bearer JWT: set `Authorization: Bearer <token>` header. Use `/api/v1/auth/login` to obtain a JWT.

Successful responses include `ok: true` and `data`. For protected endpoints, include the token.

## Response Body (Success)

```json
{
  "ok": true,
  "data": {
    "table": "...",
    "action": "...",
    "rows": [],
    "rowCount": 0,
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 0
    }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO_DATE"
  }
}
```

## Response Body (Error)

```json
{
  "ok": false,
  "error": {
    "code": "APP_ERROR|INTERNAL_SERVER_ERROR|UNAUTHORIZED|NOT_FOUND",
    "message": "Human readable message",
    "details": null
  }
}
```

## Action Payload Shapes

### select

```json
{
  "columns": ["*"],
  "filter": {
    "and": [
      { "field": "state", "op": "eq", "value": "active" }
    ]
  },
  "orderBy": [
    { "field": "created_at", "direction": "desc" }
  ],
  "limit": 50,
  "offset": 0
}
```

### insert

```json
{
  "rows": [
    { "name": "Example" }
  ],
  "returning": ["*"]
}
```

### update

```json
{
  "set": {
    "is_active": false
  },
  "filter": {
    "field": "id",
    "op": "eq",
    "value": "uuid"
  },
  "returning": ["*"]
}
```

### delete

```json
{
  "filter": {
    "field": "id",
    "op": "eq",
    "value": "uuid"
  },
  "returning": ["id"]
}
```

### upsert

```json
{
  "rows": [
    { "email": "user@example.com", "first_name": "A" }
  ],
  "conflictTarget": ["email"],
  "updateColumns": ["first_name"],
  "returning": ["*"]
}
```

## Filter Operators

Supported operators:

- eq
- ne
- gt
- gte
- lt
- lte
- in
- between
- like
- ilike
- is_null
- not_null
- contains

Use group operators:

- `{"and": [ ... ]}`
- `{"or": [ ... ]}`
- `{"not": { ... }}`
