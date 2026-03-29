import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "data.sql");

if (!fs.existsSync(schemaPath)) {
  // eslint-disable-next-line no-console
  console.error("data.sql not found at project root");
  process.exit(1);
}

const content = fs.readFileSync(schemaPath, "utf8");
const tableCount = (content.match(/CREATE TABLE public\./g) || []).length;
const enumCount = (content.match(/CREATE TYPE public\./g) || []).length;

// eslint-disable-next-line no-console
console.log(`Schema file check passed: ${tableCount} tables, ${enumCount} enum types.`);
