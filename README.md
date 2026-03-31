# YOUKT Express Gateway

This project provides a schema-aware Express + Supabase Postgres gateway for your YOUKT database.

It supports CRUD for all tables in your SQL schema through a single, consistent JSON API format.

## Features

- Generic CRUD for every table in schema public
- Actions: select, insert, update, delete, upsert
- Schema introspection at startup (columns, primary keys, enums)
- SQL injection protection using strict identifier validation and parameterized queries
- Optional API key authentication through x-api-key
- Generated docs per table from data.sql

## Tech Stack

- Node.js (ES Modules)
- Express
- Supabase Postgres (pg)

## Project Structure

- src/server.js: application bootstrap
- src/routes/data.js: main data endpoint
- src/routes/meta.js: schema metadata endpoints
- src/routes/health.js: health endpoint
- src/services/data-gateway.js: action handlers for CRUD
- src/db/schema-cache.js: schema introspection cache
- src/utils/sql.js: safe SQL clause construction
- scripts/generate-docs.js: generates docs from data.sql
- docs/schema-overview.md: tables and enums overview
- docs/request-response.md: global request and response contract
- docs/tables/*.md: per-table docs

## Setup

1. Install dependencies

npm install

2. Configure environment

cp .env.example .env

3. Ensure Supabase Postgres has your schema loaded

psql "<SUPABASE_DB_URL>" -f data.sql

4. Generate docs from schema

npm run generate-docs

5. Start server

npm run start

For development with auto-reload:

npm run dev

## Environment Variables

- PORT: API port (default: 4000)
- SUPABASE_DB_URL: Supabase Postgres connection string
- SUPABASE_URL: Supabase project URL (for clients)
- SUPABASE_ANON_KEY: Supabase anon key (for clients)
- DB_SSL: true/false
- DB_SCHEMA: schema name (default: public)
- API_KEY: optional shared API key
- MAX_LIMIT: max select page size (default: 200)

## API Endpoints

- GET /api/v1/health
- GET /api/v1/meta/tables
- POST /api/v1/meta/reload
- POST /api/v1/data

## Core Request Format

POST /api/v1/data

{
  "table": "users",
  "action": "select",
  "payload": {
    "columns": ["id", "email", "is_active"],
    "filter": {
      "and": [
        { "field": "is_active", "op": "eq", "value": true }
      ]
    },
    "orderBy": [
      { "field": "created_at", "direction": "desc" }
    ],
    "limit": 25,
    "offset": 0
  }
}

## Action Payloads

1. select

- columns: array of column names or ["*"]
- filter: nested condition tree
- orderBy: array of { field, direction }
- limit: integer
- offset: integer

2. insert

- rows: array of row objects
- returning: optional array of columns

3. update

- set: object with fields to update
- filter: required condition tree
- returning: optional array of columns

4. delete

- filter: required condition tree
- returning: optional array of columns

5. upsert

- rows: array of row objects
- conflictTarget: array of unique/PK columns
- updateColumns: optional array of columns to update on conflict
- returning: optional array of columns

## Filter Operators

- eq, ne, gt, gte, lt, lte
- in, between
- like, ilike
- is_null, not_null
- contains (jsonb contains)
- and, or, not for nesting

## Success Response Format

{
  "ok": true,
  "data": {
    "table": "users",
    "action": "select",
    "rows": [],
    "rowCount": 0,
    "pagination": {
      "limit": 25,
      "offset": 0,
      "total": 0
    }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-03-29T00:00:00.000Z"
  }
}

## Error Response Format

{
  "ok": false,
  "error": {
    "code": "APP_ERROR",
    "message": "Human readable explanation",
    "details": null
  }
}

## Docs for Every Table

After running npm run generate-docs:

- docs/schema-overview.md: all enums and all tables
- docs/request-response.md: common API contract
- docs/tables/<table>.md: one file per table from data.sql

Generated per-table docs include:

- Columns and types
- Nullability and default status
- Required on insert
- Example request body
- Example response body

## Basic Usage Examples

Select from job requisitions:

{
  "table": "job_requisitions",
  "action": "select",
  "payload": {
    "filter": { "field": "state", "op": "eq", "value": "active" },
    "orderBy": [{ "field": "created_at", "direction": "desc" }],
    "limit": 20,
    "offset": 0
  }
}

Insert candidate:

{
  "table": "candidates",
  "action": "insert",
  "payload": {
    "rows": [
      {
        "email": "candidate@example.com",
        "first_name": "Lina",
        "last_name": "Khan"
      }
    ],
    "returning": ["id", "email", "created_at"]
  }
}

Update application status:

{
  "table": "applications",
  "action": "update",
  "payload": {
    "set": { "status": "under_review" },
    "filter": { "field": "id", "op": "eq", "value": "application-uuid" },
    "returning": ["id", "status", "updated_at"]
  }
}

Delete webhook records already processed:

{
  "table": "incoming_webhooks",
  "action": "delete",
  "payload": {
    "filter": {
      "and": [
        { "field": "processed", "op": "eq", "value": true }
      ]
    },
    "returning": ["id"]
  }
}

Upsert user by provider identity:

{
  "table": "users",
  "action": "upsert",
  "payload": {
    "rows": [
      {
        "email": "sso-user@example.com",
        "auth_provider": "google",
        "auth_provider_id": "google-123",
        "first_name": "SSO",
        "last_name": "User"
      }
    ],
    "conflictTarget": ["auth_provider", "auth_provider_id"],
    "updateColumns": ["email", "first_name", "last_name"],
    "returning": ["id", "email", "updated_at"]
  }
}

## Notes

- This gateway assumes trusted internal consumers (UI/UX, internal tools), but still validates schema and query structure.
- For production, place behind HTTPS, set API_KEY, and add rate limiting and audit logs.
