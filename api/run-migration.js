require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from .env
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'dentist_newdb',
  user: process.env.DB_USER || 'dentist',
  password: String(process.env.DB_PASS || 'dentist@345').replace(/"/g, '')
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'create-procedures-categories-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Running migration: create-procedures-categories-table.sql');
    
    // Execute the SQL
    const result = await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Procedure counts by category:');
    
    // Get the summary
    const summary = await client.query(`
      SELECT category, COUNT(*) as procedure_count 
      FROM procedures 
      GROUP BY category 
      ORDER BY category
    `);
    
    summary.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.procedure_count} procedures`);
    });
    
    // Get total count
    const total = await client.query('SELECT COUNT(*) as total FROM procedures');
    console.log(`\n✨ Total procedures: ${total.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running!');
    } else if (error.code === '28P01') {
      console.error('\n💡 Check your database credentials in api/.env');
    } else if (error.code === '42P07') {
      console.log('\n⚠️  Table already exists. Skipping creation.');
      console.log('   If you want to recreate it, drop the table first:');
      console.log('   DROP TABLE procedures;');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
