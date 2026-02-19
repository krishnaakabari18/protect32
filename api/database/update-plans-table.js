const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dentist_newdb',
  user: process.env.DB_USER || 'dentist',
  password: process.env.DB_PASS || 'dentist@345',
});

async function updatePlansTable() {
  try {
    console.log('Connecting to database...');
    
    // Add provider_id column
    console.log('Adding provider_id column to plans table...');
    await pool.query(`
      ALTER TABLE plans 
      ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('✓ provider_id column added');

    // Add index
    console.log('Creating index on provider_id...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plans_provider ON plans(provider_id)
    `);
    console.log('✓ Index created');

    console.log('\n✅ Plans table updated successfully!');
  } catch (error) {
    console.error('❌ Error updating plans table:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePlansTable();
