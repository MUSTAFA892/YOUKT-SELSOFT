import { AppError } from "../errors.js";

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const quoteIdent = (value) => {
  if (!IDENTIFIER.test(value)) {
    throw new AppError(`Invalid SQL identifier: ${value}`, 400);
  }
  return `"${value}"`;
};

export const parseColumns = (requestedColumns, tableMeta) => {
  if (!requestedColumns || requestedColumns.length === 0) {
    return ["*"];
  }

  if (!Array.isArray(requestedColumns)) {
    throw new AppError("columns must be an array", 400);
  }

  return requestedColumns.map((column) => {
    if (column === "*") return "*";
    if (!tableMeta.columns[column]) {
      throw new AppError(`Unknown column '${column}' for table '${tableMeta.tableName}'`, 400);
    }
    return quoteIdent(column);
  });
};

const ensureField = (tableMeta, field) => {
  if (!tableMeta.columns[field]) {
    throw new AppError(`Unknown field '${field}' for table '${tableMeta.tableName}'`, 400);
  }
};

const addValue = (state, value) => {
  state.values.push(value);
  return `$${state.values.length}`;
};

const parsePredicate = (tableMeta, node, state) => {
  if (!node || typeof node !== "object") {
    throw new AppError("Invalid filter node", 400);
  }

  if (Array.isArray(node.and)) {
    if (node.and.length === 0) throw new AppError("filter.and cannot be empty", 400);
    const chunks = node.and.map((item) => `(${parsePredicate(tableMeta, item, state)})`);
    return chunks.join(" AND ");
  }

  if (Array.isArray(node.or)) {
    if (node.or.length === 0) throw new AppError("filter.or cannot be empty", 400);
    const chunks = node.or.map((item) => `(${parsePredicate(tableMeta, item, state)})`);
    return chunks.join(" OR ");
  }

  if (node.not) {
    return `NOT (${parsePredicate(tableMeta, node.not, state)})`;
  }

  const { field, op = "eq", value } = node;
  if (!field) {
    throw new AppError("Filter condition is missing field", 400);
  }

  ensureField(tableMeta, field);
  const column = quoteIdent(field);

  switch (op) {
    case "eq":
      return `${column} = ${addValue(state, value)}`;
    case "ne":
      return `${column} <> ${addValue(state, value)}`;
    case "gt":
      return `${column} > ${addValue(state, value)}`;
    case "gte":
      return `${column} >= ${addValue(state, value)}`;
    case "lt":
      return `${column} < ${addValue(state, value)}`;
    case "lte":
      return `${column} <= ${addValue(state, value)}`;
    case "in": {
      if (!Array.isArray(value) || value.length === 0) {
        throw new AppError("Operator 'in' requires a non-empty array value", 400);
      }
      const placeholders = value.map((item) => addValue(state, item));
      return `${column} IN (${placeholders.join(", ")})`;
    }
    case "between": {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new AppError("Operator 'between' requires exactly 2 values", 400);
      }
      const min = addValue(state, value[0]);
      const max = addValue(state, value[1]);
      return `${column} BETWEEN ${min} AND ${max}`;
    }
    case "like":
      return `${column} LIKE ${addValue(state, value)}`;
    case "ilike":
      return `${column} ILIKE ${addValue(state, value)}`;
    case "is_null":
      return `${column} IS NULL`;
    case "not_null":
      return `${column} IS NOT NULL`;
    case "contains":
      return `${column} @> ${addValue(state, JSON.stringify(value))}::jsonb`;
    default:
      throw new AppError(`Unsupported filter operator '${op}'`, 400);
  }
};

export const buildWhereClause = (tableMeta, filter, initialValues = []) => {
  const state = { values: [...initialValues] };
  if (!filter) {
    return { sql: "", values: state.values };
  }
  const clause = parsePredicate(tableMeta, filter, state);
  return { sql: `WHERE ${clause}`, values: state.values };
};

export const buildOrderByClause = (tableMeta, orderBy) => {
  if (!orderBy || orderBy.length === 0) return "";
  if (!Array.isArray(orderBy)) {
    throw new AppError("orderBy must be an array", 400);
  }

  const chunks = orderBy.map((item) => {
    if (!item.field) throw new AppError("orderBy item requires field", 400);
    ensureField(tableMeta, item.field);
    const direction = (item.direction || "asc").toLowerCase();
    if (!["asc", "desc"].includes(direction)) {
      throw new AppError("orderBy direction must be 'asc' or 'desc'", 400);
    }
    return `${quoteIdent(item.field)} ${direction.toUpperCase()}`;
  });

  return `ORDER BY ${chunks.join(", ")}`;
};
