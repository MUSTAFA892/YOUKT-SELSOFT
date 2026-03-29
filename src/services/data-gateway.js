import { pool } from "../db/pool.js";
import { config } from "../config.js";
import { AppError } from "../errors.js";
import { ensureSchemaCache } from "../db/schema-cache.js";
import {
  quoteIdent,
  parseColumns,
  buildOrderByClause,
  buildWhereClause
} from "../utils/sql.js";

const ensureTableMeta = async (table) => {
  const cache = await ensureSchemaCache(config.db.schema);
  const tableMeta = cache.tables[table];
  if (!tableMeta) {
    throw new AppError(`Unknown table '${table}'`, 404);
  }
  return tableMeta;
};

const validateRowColumns = (tableMeta, row, { forbidPrimaryKey = false } = {}) => {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new AppError("rows must contain object values", 400);
  }

  for (const key of Object.keys(row)) {
    if (!tableMeta.columns[key]) {
      throw new AppError(`Unknown column '${key}' in table '${tableMeta.tableName}'`, 400);
    }
    if (forbidPrimaryKey && tableMeta.primaryKey.includes(key)) {
      throw new AppError(`Primary key column '${key}' cannot be updated`, 400);
    }
  }
};

const requiredInsertColumns = (tableMeta) => {
  return Object.values(tableMeta.columns)
    .filter((column) => !column.nullable && !column.defaultValue)
    .map((column) => column.name);
};

const ensureLimitOffset = (limit, offset) => {
  const parsedLimit = Number.isInteger(limit) ? limit : 50;
  const parsedOffset = Number.isInteger(offset) ? offset : 0;

  if (parsedLimit < 1 || parsedLimit > config.maxLimit) {
    throw new AppError(`limit must be between 1 and ${config.maxLimit}`, 400);
  }

  if (parsedOffset < 0) {
    throw new AppError("offset must be >= 0", 400);
  }

  return { limit: parsedLimit, offset: parsedOffset };
};

const buildReturning = (tableMeta, returning) => {
  const columns = parseColumns(returning, tableMeta);
  return columns.join(", ");
};

const executeSelect = async (tableMeta, payload) => {
  const columns = parseColumns(payload.columns, tableMeta).join(", ");
  const { limit, offset } = ensureLimitOffset(payload.limit, payload.offset);
  const orderByClause = buildOrderByClause(tableMeta, payload.orderBy);
  const where = buildWhereClause(tableMeta, payload.filter);

  const values = [...where.values, limit, offset];
  const limitParam = `$${values.length - 1}`;
  const offsetParam = `$${values.length}`;

  const sql = `
    SELECT ${columns}
    FROM ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
    ${where.sql}
    ${orderByClause}
    LIMIT ${limitParam}
    OFFSET ${offsetParam};
  `;

  const totalSql = `
    SELECT COUNT(*)::int AS total
    FROM ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
    ${where.sql};
  `;

  const [result, totalResult] = await Promise.all([
    pool.query(sql, values),
    pool.query(totalSql, where.values)
  ]);

  return {
    rows: result.rows,
    pagination: {
      limit,
      offset,
      total: totalResult.rows[0]?.total || 0
    }
  };
};

const executeInsert = async (tableMeta, payload) => {
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw new AppError("insert action requires payload.rows as a non-empty array", 400);
  }

  payload.rows.forEach((row) => validateRowColumns(tableMeta, row));

  const required = requiredInsertColumns(tableMeta);
  for (const row of payload.rows) {
    for (const field of required) {
      if (typeof row[field] === "undefined" || row[field] === null) {
        throw new AppError(`Missing required field '${field}' for insert`, 400);
      }
    }
  }

  const columns = Array.from(
    new Set(payload.rows.flatMap((row) => Object.keys(row)))
  );

  if (columns.length === 0) {
    throw new AppError("At least one insert column must be provided", 400);
  }

  const values = [];
  const valueChunks = payload.rows.map((row) => {
    const placeholders = columns.map((column) => {
      values.push(typeof row[column] === "undefined" ? null : row[column]);
      return `$${values.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  const returningClause = buildReturning(tableMeta, payload.returning);

  const sql = `
    INSERT INTO ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
      (${columns.map(quoteIdent).join(", ")})
    VALUES ${valueChunks.join(", ")}
    RETURNING ${returningClause};
  `;

  const result = await pool.query(sql, values);

  return {
    rowCount: result.rowCount,
    rows: result.rows
  };
};

const executeUpdate = async (tableMeta, payload) => {
  if (!payload.set || typeof payload.set !== "object" || Array.isArray(payload.set)) {
    throw new AppError("update action requires payload.set object", 400);
  }

  validateRowColumns(tableMeta, payload.set, { forbidPrimaryKey: true });

  const setKeys = Object.keys(payload.set);
  if (setKeys.length === 0) {
    throw new AppError("update payload.set cannot be empty", 400);
  }

  const setValues = [];
  const setSql = setKeys
    .map((column) => {
      setValues.push(payload.set[column]);
      return `${quoteIdent(column)} = $${setValues.length}`;
    })
    .join(", ");

  const where = buildWhereClause(tableMeta, payload.filter, setValues);
  if (!where.sql) {
    throw new AppError("update action requires payload.filter", 400);
  }

  const returningClause = buildReturning(tableMeta, payload.returning);

  const sql = `
    UPDATE ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
    SET ${setSql}
    ${where.sql}
    RETURNING ${returningClause};
  `;

  const result = await pool.query(sql, where.values);
  return { rowCount: result.rowCount, rows: result.rows };
};

const executeDelete = async (tableMeta, payload) => {
  const where = buildWhereClause(tableMeta, payload.filter);
  if (!where.sql) {
    throw new AppError("delete action requires payload.filter", 400);
  }

  const returningClause = buildReturning(tableMeta, payload.returning || tableMeta.primaryKey || ["*"]);

  const sql = `
    DELETE FROM ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
    ${where.sql}
    RETURNING ${returningClause};
  `;

  const result = await pool.query(sql, where.values);
  return { rowCount: result.rowCount, rows: result.rows };
};

const executeUpsert = async (tableMeta, payload) => {
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw new AppError("upsert action requires payload.rows as a non-empty array", 400);
  }

  if (!Array.isArray(payload.conflictTarget) || payload.conflictTarget.length === 0) {
    throw new AppError("upsert action requires payload.conflictTarget array", 400);
  }

  payload.rows.forEach((row) => validateRowColumns(tableMeta, row));

  const allColumns = Array.from(new Set(payload.rows.flatMap((row) => Object.keys(row))));
  if (allColumns.length === 0) {
    throw new AppError("upsert rows must include at least one column", 400);
  }

  for (const conflictColumn of payload.conflictTarget) {
    if (!tableMeta.columns[conflictColumn]) {
      throw new AppError(`Unknown conflictTarget column '${conflictColumn}'`, 400);
    }
  }

  let updateColumns = payload.updateColumns;
  if (!Array.isArray(updateColumns) || updateColumns.length === 0) {
    updateColumns = allColumns.filter((column) => !payload.conflictTarget.includes(column));
  }

  for (const column of updateColumns) {
    if (!tableMeta.columns[column]) {
      throw new AppError(`Unknown updateColumns field '${column}'`, 400);
    }
  }

  const values = [];
  const valueChunks = payload.rows.map((row) => {
    const placeholders = allColumns.map((column) => {
      values.push(typeof row[column] === "undefined" ? null : row[column]);
      return `$${values.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  const setClause = updateColumns
    .map((column) => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`)
    .join(", ");

  if (!setClause) {
    throw new AppError("upsert requires at least one updatable column", 400);
  }

  const returningClause = buildReturning(tableMeta, payload.returning);

  const sql = `
    INSERT INTO ${quoteIdent(config.db.schema)}.${quoteIdent(tableMeta.tableName)}
      (${allColumns.map(quoteIdent).join(", ")})
    VALUES ${valueChunks.join(", ")}
    ON CONFLICT (${payload.conflictTarget.map(quoteIdent).join(", ")})
    DO UPDATE SET ${setClause}
    RETURNING ${returningClause};
  `;

  const result = await pool.query(sql, values);
  return { rowCount: result.rowCount, rows: result.rows };
};

const handlers = {
  select: executeSelect,
  insert: executeInsert,
  update: executeUpdate,
  delete: executeDelete,
  upsert: executeUpsert
};

export const executeAction = async ({ table, action, payload = {} }) => {
  if (!table || typeof table !== "string") {
    throw new AppError("table is required", 400);
  }

  if (!action || typeof action !== "string") {
    throw new AppError("action is required", 400);
  }

  const normalizedAction = action.toLowerCase();
  const handler = handlers[normalizedAction];
  if (!handler) {
    throw new AppError("Unsupported action. Use select|insert|update|delete|upsert", 400);
  }

  const tableMeta = await ensureTableMeta(table);
  const result = await handler(tableMeta, payload);

  return {
    table,
    action: normalizedAction,
    ...result
  };
};
