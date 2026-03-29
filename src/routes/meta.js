import { Router } from "express";
import { config } from "../config.js";
import { ensureSchemaCache, loadSchemaCache } from "../db/schema-cache.js";

export const metaRouter = Router();

metaRouter.get("/meta/tables", async (req, res, next) => {
  try {
    const schemaCache = await ensureSchemaCache(config.db.schema);

    const tables = Object.values(schemaCache.tables).map((table) => ({
      table: table.tableName,
      primaryKey: table.primaryKey,
      columns: Object.values(table.columns).map((column) => ({
        name: column.name,
        dataType: column.dataType,
        nullable: column.nullable,
        hasDefault: Boolean(column.defaultValue),
        enumValues: column.enumValues
      }))
    }));

    res.status(200).json({
      ok: true,
      data: {
        schema: schemaCache.schema,
        loadedAt: schemaCache.loadedAt,
        tables,
        enums: schemaCache.enums
      }
    });
  } catch (error) {
    next(error);
  }
});

metaRouter.post("/meta/reload", async (req, res, next) => {
  try {
    const schemaCache = await loadSchemaCache(config.db.schema);

    res.status(200).json({
      ok: true,
      data: {
        schema: schemaCache.schema,
        loadedAt: schemaCache.loadedAt,
        tableCount: Object.keys(schemaCache.tables).length
      }
    });
  } catch (error) {
    next(error);
  }
});
