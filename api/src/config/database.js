const { Pool, types } = require('pg');

// Return date columns as plain strings (YYYY-MM-DD) instead of JS Date objects
// This prevents "2026-04-12T18:30:00.000Z" timezone conversion issues
types.setTypeParser(1082, val => val);  // date
types.setTypeParser(1114, val => val);  // timestamp without timezone
types.setTypeParser(1184, val => val);  // timestamp with timezone

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'dentist_newdb',
  user: process.env.DB_USER || 'dentist',
  password: String(process.env.DB_PASS || 'dentist@345'),
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
