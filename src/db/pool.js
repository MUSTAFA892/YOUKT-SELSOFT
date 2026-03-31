import pg from "pg";
import { URL } from "node:url";
import { config } from "../config.js";

const { Pool } = pg;

// Parse connection string into components to force IPv4
const parseConnectionString = (connectionString) => {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false }
    };
  } catch (err) {
    console.error("Failed to parse connection string:", err);
    throw err;
  }
};

const dbConfig = {
  ...parseConnectionString(config.db.url),
  ssl: config.db.ssl,
  family: 4,  // Force IPv4 only
  connectionTimeoutMillis: 10000
};

export const pool = new Pool(dbConfig);
