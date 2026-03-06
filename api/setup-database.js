const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// First, connect as postgres superuser to create database and user
async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');
  
  // Connect as postgres superuser
  const superuserPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres' // Default password, change if different
  });

  try {
    const client = await superuserPool.connect();
    console.log('✅ Connected as postgres superuser\n');

    // Check if dentist user exists
    console.log('📋 Checking if user "dentist" exists...');
    const userCheck = await client.query(`
      SELECT 1 FROM pg_roles WHERE rolname='dentist'
    `);

    if (userCheck.rows.length === 0) {
      console.log('Creating user "dentist"...');
      await client.query(`CREATE USER dentist WITH PASSWORD 'dentist@345'`);
      console.log('✅ User "dentist" created\n');
    } else {
      console.log('✅ User "dentist" already exists\n');
    }

    // Check if database exists
    console.log('📋 Checking if database "dentist_newdb" exists...');
    const dbCheck = await client.query(`
      SELECT 1 FROM pg_database WHERE datname='dentist_newdb'
    `);

    if (dbCheck.rows.length === 0) {
      console.log('Creating database "dentist_newdb"...');
      await client.query(`CREATE DATABASE dentist_newdb OWNER dentist`);
      console.log('✅ Database "dentist_newdb" created\n');
    } else {
      console.log('✅ Database "dentist_newdb" already exists\n');
    }

    client.release();
    await superuserPool.end();

    // Now connect to dentist_newdb as postgres to set up extensions and permissions
    console.log('📋 Setting up database extensions and permissions...');
    const dbPool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      database: 'dentist_newdb',
      user: 'postgres',
      password: 'postgres'
    });

    const dbClient = await dbPool.connect();

    // Create UUID extension
    console.log('Creating uuid-ossp extension...');
    await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log('✅ Extension created\n');

    // Grant all privileges
    console.log('Granting privileges to dentist user...');
    await dbClient.query(`GRANT ALL ON SCHEMA public TO dentist`);
    await dbClient.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dentist`);
    await dbClient.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dentist`);
    await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dentist`);
    await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dentist`);
    console.log('✅ Privileges granted\n');

    dbClient.release();
    await dbPool.end();

    console.log('🎉 Database setup completed successfully!\n');
    console.log('Now running procedures migration...\n');

    // Now run the procedures migration as dentist user
    await runProceduresMigration();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running. Please start PostgreSQL service.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please update the postgres password in this script.');
      console.error('   Default password tried: "postgres"');
      console.error('\n   To find your postgres password:');
      console.error('   1. Check your PostgreSQL installation notes');
      console.error('   2. Or reset it using pg_hba.conf (see DATABASE_SETUP_INSTRUCTIONS.md)');
    } else if (error.code === '42501') {
      console.error('\n💡 Permission denied. Make sure you\'re running as postgres superuser.');
    }
    
    process.exit(1);
  }
}

async function runProceduresMigration() {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'dentist_newdb',
    user: 'dentist',
    password: 'dentist@345'
  });

  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected as dentist user');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'create-procedures-categories-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Running migration: create-procedures-categories-table.sql\n');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Procedure counts by category:');
    
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
    
    console.log('\n🎉 All done! You can now:');
    console.log('   1. Start the API server: cd api && npm start');
    console.log('   2. View Swagger docs: http://localhost:8080/api-docs');
    console.log('   3. Test the feature: http://localhost:3000/management/provider-fees');
    
  } catch (error) {
    if (error.code === '42P07') {
      console.log('⚠️  Procedures table already exists.');
      console.log('   Checking existing data...\n');
      
      const total = await client.query('SELECT COUNT(*) as total FROM procedures');
      console.log(`   Found ${total.rows[0].total} procedures in database`);
      
      if (total.rows[0].total > 0) {
        console.log('\n✅ Database is already set up!');
        console.log('\n   You can now:');
        console.log('   1. Start the API server: cd api && npm start');
        console.log('   2. View Swagger docs: http://localhost:8080/api-docs');
        console.log('   3. Test the feature: http://localhost:3000/management/provider-fees');
      }
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
