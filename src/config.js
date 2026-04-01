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
    url: process.env.SUPABASE_DB_URL || "",
    ssl: parseBoolean(process.env.DB_SSL, true) ? { rejectUnauthorized: false } : false,
    schema: process.env.DB_SCHEMA || "public"
  },
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || ""
  },
  apiKey: process.env.API_KEY || "",
  maxLimit: toInt(process.env.MAX_LIMIT, 200)
};

config.jwtSecret = process.env.JWT_SECRET || "replace-this-secret-in-production";
config.jwtExpiry = process.env.JWT_EXPIRY || "12h";
config.bcryptRounds = toInt(process.env.BCRYPT_ROUNDS, 10);
