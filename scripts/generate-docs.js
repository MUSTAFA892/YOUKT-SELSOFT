import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "data.sql");
const docsDir = path.join(root, "docs");
const tablesDir = path.join(docsDir, "tables");

if (!fs.existsSync(schemaPath)) {
  // eslint-disable-next-line no-console
  console.error("Missing data.sql file. Cannot generate docs.");
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, "utf8");

const parseEnums = (input) => {
  const regex = /CREATE TYPE public\.([a-zA-Z0-9_]+) AS ENUM \(([\s\S]*?)\);/g;
  const enums = {};
  let match = regex.exec(input);
  while (match) {
    const [, enumName, valuesBlock] = match;
    const values = [...valuesBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    enums[enumName] = values;
    match = regex.exec(input);
  }
  return enums;
};

const cleanType = (raw) => raw.replace(/,$/, "").trim();

const splitTopLevelEntries = (body) => {
  const entries = [];
  let current = "";
  let depth = 0;
  let inString = false;

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    const prev = i > 0 ? body[i - 1] : "";

    if (char === "'" && prev !== "\\") {
      inString = !inString;
      current += char;
      continue;
    }

    if (!inString) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;

      if (char === "," && depth === 0) {
        entries.push(current.trim());
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    entries.push(current.trim());
  }

  return entries;
};

const parseColumnLine = (line) => {
  const trimmed = line.trim().replace(/,$/, "");
  if (!trimmed) return null;
  if (/^(CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)\s/i.test(trimmed)) return null;

  const nameMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+(.+)$/);
  if (!nameMatch) return null;

  const [, name, rest] = nameMatch;
  if (["PRIMARY", "UNIQUE", "CHECK", "FOREIGN"].includes(name.toUpperCase())) {
    return null;
  }

  const typeMatch = rest.match(/^(.*?)(\s+(DEFAULT|NOT NULL|NULL|REFERENCES|CHECK|UNIQUE|PRIMARY KEY)\b|$)/i);
  const typeChunk = typeMatch ? typeMatch[1] : rest;

  const nullable = !/\sNOT NULL(\s|$)/i.test(rest);
  const hasInlinePrimary = /\sPRIMARY KEY(\s|$)/i.test(rest);
  const defaultMatch = rest.match(/\sDEFAULT\s+(.+?)(\s+(NOT NULL|NULL|CHECK|REFERENCES|UNIQUE|PRIMARY KEY)|$)/i);

  return {
    name,
    type: cleanType(typeChunk),
    nullable: hasInlinePrimary ? false : nullable,
    hasDefault: Boolean(defaultMatch),
    defaultValue: defaultMatch ? defaultMatch[1].trim() : ""
  };
};

const parseTables = (input) => {
  const tableRegex = /CREATE TABLE public\.([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/g;
  const tables = [];
  let match = tableRegex.exec(input);

  while (match) {
    const [, tableName, body] = match;
    const entries = splitTopLevelEntries(body);
    const columns = entries.map(parseColumnLine).filter(Boolean);

    const pkRegex = new RegExp(`CREATE TABLE public\\.${tableName}\\s*\\(([\\s\\S]*?)\\);`);
    const tableBlock = input.match(pkRegex)?.[1] || body;

    const pkInline = columns
      .filter((column) => /PRIMARY KEY/i.test(body.split("\n").find((l) => l.trim().startsWith(column.name + " ")) || ""))
      .map((column) => column.name);

    const pkConstraintMatch = tableBlock.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
    const pkConstraint = pkConstraintMatch
      ? pkConstraintMatch[1].split(",").map((x) => x.trim().replace(/"/g, ""))
      : [];

    const primaryKey = Array.from(new Set([...pkInline, ...pkConstraint]));

    tables.push({ tableName, columns, primaryKey });
    match = tableRegex.exec(input);
  }

  return tables;
};

const enums = parseEnums(sql);
const tables = parseTables(sql);

fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(tablesDir, { recursive: true });

const requestFormatDoc = `# Gateway Request and Response Format

All data operations use one endpoint:

- Method: POST
- URL: /api/v1/data
- Content-Type: application/json

## Request Body

{\n  "table": "<table_name>",\n  "action": "select|insert|update|delete|upsert",\n  "payload": { ... }\n}

## Response Body (Success)

{\n  "ok": true,\n  "data": {\n    "table": "...",\n    "action": "...",\n    "rows": [ ... ],\n    "rowCount": 0,\n    "pagination": {\n      "limit": 50,\n      "offset": 0,\n      "total": 0\n    }\n  },\n  "meta": {\n    "requestId": "uuid",\n    "timestamp": "ISO_DATE"\n  }\n}

## Response Body (Error)

{\n  "ok": false,\n  "error": {\n    "code": "APP_ERROR|INTERNAL_SERVER_ERROR|UNAUTHORIZED|NOT_FOUND",\n    "message": "Human readable message",\n    "details": null\n  }\n}

## Action Payload Shapes

### select

{\n  "columns": ["*"],\n  "filter": {\n    "and": [\n      { "field": "state", "op": "eq", "value": "active" }\n    ]\n  },\n  "orderBy": [\n    { "field": "created_at", "direction": "desc" }\n  ],\n  "limit": 50,\n  "offset": 0\n}

### insert

{\n  "rows": [\n    { "name": "Example" }\n  ],\n  "returning": ["*"]\n}

### update

{\n  "set": {\n    "is_active": false\n  },\n  "filter": {\n    "field": "id",\n    "op": "eq",\n    "value": "uuid"\n  },\n  "returning": ["*"]\n}

### delete

{\n  "filter": {\n    "field": "id",\n    "op": "eq",\n    "value": "uuid"\n  },\n  "returning": ["id"]\n}

### upsert

{\n  "rows": [\n    { "email": "user@example.com", "first_name": "A" }\n  ],\n  "conflictTarget": ["email"],\n  "updateColumns": ["first_name"],\n  "returning": ["*"]\n}

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

- { "and": [ ... ] }
- { "or": [ ... ] }
- { "not": { ... } }
`;

fs.writeFileSync(path.join(docsDir, "request-response.md"), requestFormatDoc, "utf8");

for (const table of tables) {
  const requiredOnInsert = table.columns
    .filter((column) => !column.nullable && !column.hasDefault)
    .map((column) => column.name);

  const tableDoc = [
    `# Table: ${table.tableName}`,
    "",
    "## Metadata",
    "",
    `- Primary key: ${table.primaryKey.length ? table.primaryKey.join(", ") : "(none detected)"}`,
    `- Total columns: ${table.columns.length}`,
    "",
    "## Columns",
    "",
    "| Column | Type | Nullable | Has Default | Required on Insert |",
    "|---|---|---|---|---|"
  ];

  for (const column of table.columns) {
    tableDoc.push(
      `| ${column.name} | ${column.type} | ${column.nullable ? "YES" : "NO"} | ${column.hasDefault ? "YES" : "NO"} | ${requiredOnInsert.includes(column.name) ? "YES" : "NO"} |`
    );
    if (column.type.startsWith("public.") && enums[column.type.replace("public.", "")]) {
      tableDoc.push(`|  | Enum Values | ${enums[column.type.replace("public.", "")].join(", ")} |  |  |`);
    }
  }

  tableDoc.push("", "## Request Example", "", "```json");
  tableDoc.push(
    JSON.stringify(
      {
        table: table.tableName,
        action: "select",
        payload: {
          columns: ["*"],
          limit: 20,
          offset: 0,
          orderBy: table.columns[0] ? [{ field: table.columns[0].name, direction: "desc" }] : []
        }
      },
      null,
      2
    )
  );
  tableDoc.push("```", "", "## Response Example", "", "```json");
  tableDoc.push(
    JSON.stringify(
      {
        ok: true,
        data: {
          table: table.tableName,
          action: "select",
          rows: [],
          pagination: {
            limit: 20,
            offset: 0,
            total: 0
          }
        },
        meta: {
          requestId: "uuid",
          timestamp: "2026-01-01T00:00:00.000Z"
        }
      },
      null,
      2
    )
  );
  tableDoc.push("```", "");

  fs.writeFileSync(path.join(tablesDir, `${table.tableName}.md`), tableDoc.join("\n"), "utf8");
}

const overview = [
  "# YOUKT Schema Overview",
  "",
  `- Enum types: ${Object.keys(enums).length}`,
  `- Tables: ${tables.length}`,
  "",
  "## Enum Types",
  "",
  "| Enum | Values |",
  "|---|---|"
];

for (const [enumName, values] of Object.entries(enums)) {
  overview.push(`| ${enumName} | ${values.join(", ")} |`);
}

overview.push("", "## Tables", "", "| Table | Columns | Primary Key | Doc |", "|---|---:|---|---|");
for (const table of tables) {
  overview.push(
    `| ${table.tableName} | ${table.columns.length} | ${table.primaryKey.join(", ") || "-"} | [docs/tables/${table.tableName}.md](tables/${table.tableName}.md) |`
  );
}

fs.writeFileSync(path.join(docsDir, "schema-overview.md"), overview.join("\n"), "utf8");

// eslint-disable-next-line no-console
console.log(`Generated docs for ${tables.length} tables at docs/tables.`);
