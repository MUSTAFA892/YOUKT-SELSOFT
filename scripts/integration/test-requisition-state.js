import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { URL } from "node:url";

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

if (!API_KEY) {
  console.error("ERROR: Set API_KEY in your environment (.env)");
  process.exit(2);
}

// Parse Supabase connection string
const parseDbUrl = (connectionString) => {
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
    process.exit(1);
  }
};

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: Set SUPABASE_DB_URL in .env");
  process.exit(2);
}

const pool = new Pool({
  ...parseDbUrl(dbUrl),
  family: 4  // Force IPv4
});

const randomEmail = () => `test+${Date.now()}@example.com`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  console.log("Starting requisition state integration test...");
  const client = await pool.connect();
  let userId = null;
  let requisitionId = null;

  try {
    await client.query("BEGIN");

    // 1) Create a temporary user
    const userRes = await client.query(
      `INSERT INTO public.users (email, auth_provider, first_name, last_name)
       VALUES ($1, 'local', 'TestUser', 'Integration')
       RETURNING id`,
      [randomEmail()]
    );
    userId = userRes.rows[0].id;
    console.log("Created user:", userId);

    // 2) Insert a minimal requisition
    const insertReqRes = await client.query(
      `INSERT INTO public.job_requisitions
       (creator_id, title, department, location, job_type, experience, description)
       VALUES ($1, $2, $3, 'remote', 'full-time', 'entry', $4)
       RETURNING id, state`,
      [userId, 'Integration Test Requisition', 'Engineering', 'Temporary test requisition']
    );

    requisitionId = insertReqRes.rows[0].id;
    console.log("Created requisition:", requisitionId, "state:", insertReqRes.rows[0].state);

    await client.query("COMMIT");

    // 3) Call the endpoint to transition to 'approved'
    const url = `${BASE_URL}/api/v1/jobs/requisitions/${requisitionId}/state`;
    console.log("Calling endpoint:", url);

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY
      },
      body: JSON.stringify({
        to_state: "approved",
        changed_by: userId,
        reason: "Integration test approval"
      })
    });

    const body = await resp.json().catch(() => null);

    console.log("Endpoint status:", resp.status);
    console.log("Endpoint response:", JSON.stringify(body, null, 2));

    if (resp.status !== 200) {
      throw new Error(`Unexpected endpoint response status: ${resp.status}`);
    }

    // tiny wait for DB write (shouldn't be necessary but safe)
    await wait(200);

    // 4) Verify DB: requisition row and state history
    const [reqRow] = (await pool.query(
      `SELECT id, state, is_locked, approved_at FROM public.job_requisitions WHERE id = $1`,
      [requisitionId]
    )).rows;

    console.log("DB requisition row:", reqRow);

    const historyRows = (await pool.query(
      `SELECT id, from_state, to_state, changed_by, reason, changed_at
       FROM public.requisition_state_history
       WHERE requisition_id = $1
       ORDER BY changed_at DESC`,
      [requisitionId]
    )).rows;

    console.log("DB state history rows:", historyRows);

    // Basic assertions
    const okRequisition = reqRow && reqRow.state === 'approved' && reqRow.is_locked === true;
    const okHistory = Array.isArray(historyRows) && historyRows.length > 0 && historyRows[0].to_state === 'approved';

    if (okRequisition && okHistory) {
      console.log('\nTEST PASSED: Requisition moved to approved, locked, and history recorded.');
      process.exitCode = 0;
    } else {
      console.error('\nTEST FAILED: Post-checks did not match expectations.');
      process.exitCode = 3;
    }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("ERROR during test:", err);
    process.exitCode = 4;
  } finally {
    // Cleanup inserted data if present
    try {
      if (requisitionId) {
        await pool.query(`DELETE FROM public.job_requisitions WHERE id = $1`, [requisitionId]);
      }
      if (userId) {
        await pool.query(`DELETE FROM public.users WHERE id = $1`, [userId]);
      }
    } catch (cleanupErr) {
      console.warn("Cleanup error:", cleanupErr);
    }

    client.release();
    await pool.end();
    console.log("Finished test script.");
  }
};

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(10);
});
