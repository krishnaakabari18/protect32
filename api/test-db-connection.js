require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '***' : 'NOT SET');
console.log('DB_PASS type:', typeof process.env.DB_PASS);
console.log('DB_PASS value:', process.env.DB_PASS);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'dentist_newdb',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASS || 'postgres'),
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Full error:', err);
  } else {
    console.log('✅ Database connected successfully!');
    console.log('Current time from DB:', res.rows[0].now);
  }
  pool.end();
});
