// db.js
require('dotenv').config();
const { Pool } = require('pg');
const postgres = require('postgres');

// =========================================
// 🔹 SSL Configuration (required for Supabase)
// =========================================
const sslConfig = { rejectUnauthorized: false };

// =========================================
// 🔹 PostgreSQL Pool (recommended for Node apps)
// =========================================
const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT), 
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Supabase database connection error:', err.message);
  } else {
    console.log(`✅ Supabase database connected successfully on port ${process.env.SUPABASE_DB_PORT}`);
    release();
  }
});

// =========================================
// 🔹 Helper: replace ? with $1, $2...
// =========================================
const query = async (text, params) => {
  let pgText = text;
  let i = 1;
  while (pgText.includes('?')) {
    pgText = pgText.replace('?', `$${i++}`);
  }
  return pool.query(pgText, params);
};

// =========================================
// 🔹 Optional: Postgres.js (alternative client)
// =========================================
const sql = postgres({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT),
  username: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: sslConfig
});

// =========================================
// 🔹 Exports
// =========================================
module.exports = { query, pool, sql };
