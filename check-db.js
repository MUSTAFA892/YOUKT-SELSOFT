const { Client } = require('pg');
require('dotenv').config();

async function verifyConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'youkt_pipeline',
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to the 'youkt_pipeline' PostgreSQL database!");

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\nTables created by the backend automatically (TypeORM):");
    if (res.rows.length === 0) {
      console.log("No tables found yet.");
    } else {
      res.rows.forEach(row => console.log(` - ${row.table_name}`));
    }
    
    // Check if pipeline table specifically exists
    const hasPipeline = res.rows.some(r => r.table_name === 'pipeline');
    if (hasPipeline) {
      const countRes = await client.query(`SELECT COUNT(*) FROM pipeline`);
      console.log(`\nThe 'pipeline' table exists and currently has ${countRes.rows[0].count} records.`);
    }

  } catch (err) {
    console.error("❌ Error connecting to database:", err.message);
  } finally {
    await client.end();
  }
}

verifyConnection();
