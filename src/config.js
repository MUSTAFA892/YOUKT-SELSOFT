import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "undefined") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toInt(process.env.PORT, 4000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: toInt(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || "youkt",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: parseBoolean(process.env.DB_SSL, false) ? { rejectUnauthorized: false } : false,
    schema: process.env.DB_SCHEMA || "public"
  },
  apiKey: process.env.API_KEY || "",
  maxLimit: toInt(process.env.MAX_LIMIT, 200)
};
