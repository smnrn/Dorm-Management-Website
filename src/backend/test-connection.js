/**
 * DormGuard Database Connection Test Script
 * Run this to verify your .env configuration is correct
 * 
 * Usage: node test-connection.js
 */

const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

console.log('\n========================================');
console.log('🧪 DormGuard Database Connection Test');
console.log('========================================\n');

// Check if required environment variables exist
const requiredVars = [
  'SUPABASE_DB_HOST',
  'SUPABASE_DB_PORT',
  'SUPABASE_DB_USER',
  'SUPABASE_DB_PASSWORD',
  'SUPABASE_DB_NAME',
  'JWT_SECRET'
];

console.log('📋 Checking Environment Variables...\n');

let allPresent = true;
requiredVars.forEach(varName => {
  const exists = !!process.env[varName];
  const status = exists ? '✅' : '❌';
  const value = exists 
    ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '***HIDDEN***' : process.env[varName])
    : 'NOT SET';
  
  console.log(`${status} ${varName}: ${value}`);
  
  if (!exists) allPresent = false;
});

if (!allPresent) {
  console.log('\n❌ ERROR: Missing required environment variables');
  console.log('Please check your .env file in the /backend directory\n');
  process.exit(1);
}

console.log('\n✅ All environment variables are set\n');

// Test database connection
console.log('🔌 Testing Database Connection...\n');

const sslConfig = process.env.SUPABASE_DB_SSL === 'false' 
  ? false 
  : process.env.SUPABASE_DB_SSL === 'require'
  ? { rejectUnauthorized: true }
  : { rejectUnauthorized: false };

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT) || 5432,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: sslConfig,
  connectionTimeoutMillis: 10000,
});

console.log('📡 Connection Details:');
console.log(`   Host: ${process.env.SUPABASE_DB_HOST}`);
console.log(`   Port: ${process.env.SUPABASE_DB_PORT}`);
console.log(`   Database: ${process.env.SUPABASE_DB_NAME}`);
console.log(`   User: ${process.env.SUPABASE_DB_USER}`);
console.log(`   SSL: ${process.env.SUPABASE_DB_SSL}\n`);

pool.connect((err, client, release) => {
  if (err) {
    console.log('❌ DATABASE CONNECTION FAILED\n');
    console.error('Error Details:', err.message);
    console.error('\nPossible Issues:');
    console.error('  1. Check if password is correct');
    console.error('  2. Verify Supabase project is active');
    console.error('  3. Ensure internet connection is stable');
    console.error('  4. Confirm host URL is correct\n');
    process.exit(1);
  }

  console.log('✅ DATABASE CONNECTION SUCCESSFUL\n');
  
  // Test a simple query
  console.log('🔍 Testing Query Execution...\n');
  
  client.query('SELECT NOW() as current_time, version() as pg_version', (queryErr, result) => {
    release();
    
    if (queryErr) {
      console.log('❌ QUERY EXECUTION FAILED\n');
      console.error('Error:', queryErr.message);
      process.exit(1);
    }
    
    console.log('✅ QUERY EXECUTION SUCCESSFUL\n');
    console.log('📊 Database Info:');
    console.log(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' on ')[0]}`);
    console.log(`   Current Time: ${result.rows[0].current_time}\n`);
    
    // Test if tables exist
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    pool.query(tableQuery, (tableErr, tableResult) => {
      if (tableErr) {
        console.log('⚠️  Could not check tables:', tableErr.message);
        pool.end();
        process.exit(0);
      }
      
      console.log('📋 Database Tables:');
      if (tableResult.rows.length === 0) {
        console.log('   ⚠️  No tables found - You may need to run database migrations');
      } else {
        tableResult.rows.forEach(row => {
          console.log(`   ✅ ${row.table_name}`);
        });
      }
      
      console.log('\n========================================');
      console.log('✅ ALL TESTS PASSED');
      console.log('========================================\n');
      console.log('Your backend is ready to start!');
      console.log('Run: npm start\n');
      
      pool.end();
      process.exit(0);
    });
  });
});

// Handle timeout
setTimeout(() => {
  console.log('\n❌ CONNECTION TIMEOUT');
  console.log('Database took too long to respond');
  console.log('Please check your internet connection and try again\n');
  process.exit(1);
}, 15000);
