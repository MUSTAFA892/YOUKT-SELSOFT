import { pool } from "./pool.js";

let schemaCache = null;

const getPrimaryKeyColumns = async (schema) => {
  const sql = `
    SELECT
      tc.table_name,
      kcu.column_name,
      kcu.ordinal_position
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = $1
    ORDER BY tc.table_name, kcu.ordinal_position;
  `;

  const { rows } = await pool.query(sql, [schema]);
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.table_name)) {
      map.set(row.table_name, []);
    }
    map.get(row.table_name).push(row.column_name);
  }

  return map;
};

const getEnums = async (schema) => {
  const sql = `
    SELECT t.typname AS enum_name,
           e.enumlabel AS enum_value,
           e.enumsortorder AS sort_order
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = $1
    ORDER BY t.typname, e.enumsortorder;
  `;

  const { rows } = await pool.query(sql, [schema]);
  const enums = {};

  for (const row of rows) {
    if (!enums[row.enum_name]) {
      enums[row.enum_name] = [];
    }
    enums[row.enum_name].push(row.enum_value);
  }

  return enums;
};

export const loadSchemaCache = async (schema = "public") => {
  const [columnsResult, pkMap, enums] = await Promise.all([
    pool.query(
      `
      SELECT
        table_name,
        column_name,
        is_nullable,
        data_type,
        udt_name,
        column_default
      FROM information_schema.columns
      WHERE table_schema = $1
      ORDER BY table_name, ordinal_position;
      `,
      [schema]
    ),
    getPrimaryKeyColumns(schema),
    getEnums(schema)
  ]);

  const tables = {};

  for (const row of columnsResult.rows) {
    if (!tables[row.table_name]) {
      tables[row.table_name] = {
        tableName: row.table_name,
        schema,
        columns: {},
        primaryKey: pkMap.get(row.table_name) || []
      };
    }

    const isEnum = row.data_type === "USER-DEFINED" && Boolean(enums[row.udt_name]);

    tables[row.table_name].columns[row.column_name] = {
      name: row.column_name,
      nullable: row.is_nullable === "YES",
      dataType: row.data_type,
      udtName: row.udt_name,
      defaultValue: row.column_default,
      enumValues: isEnum ? enums[row.udt_name] : null
    };
  }

  schemaCache = {
    loadedAt: new Date().toISOString(),
    schema,
    tables,
    enums
  };

  return schemaCache;
};

export const getSchemaCache = () => schemaCache;

export const ensureSchemaCache = async (schema = "public") => {
  if (!schemaCache) {
    return loadSchemaCache(schema);
  }
  return schemaCache;
};
