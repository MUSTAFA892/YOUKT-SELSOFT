const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to the default 'postgres' database first
  });

  try {
    await client.connect();
    console.log("Connected to default 'postgres' database successfully.");

    const dbName = process.env.DB_DATABASE || 'youkt_pipeline';
    
    // Check if the database exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' not found, creating it...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error("Error connecting to PostgreSQL or creating database:");
    console.error(err.message);
    if (err.message.includes('password authentication failed')) {
      console.error("\nYour PostgreSQL password for 'postgres' user might be different from the one in .env.");
    }
  } finally {
    await client.end();
  }
}

createDatabase();
