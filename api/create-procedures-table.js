/**
 * Create Procedures Table and Insert Data
 * This script uses the existing database configuration from your API
 */

const fs = require('fs');
const path = require('path');

// Use the existing database pool from your API config
const pool = require('./src/config/database');

async function createProceduresTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database');
    console.log('📄 Creating procedures table and inserting data...\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'create-procedures-categories-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Procedures table created successfully!\n');
    
    // Get summary
    console.log('📊 Procedure counts by category:');
    const summary = await client.query(`
      SELECT category, COUNT(*) as procedure_count 
      FROM procedures 
      GROUP BY category 
      ORDER BY category
    `);
    
    summary.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.procedure_count} procedures`);
    });
    
    // Get total
    const total = await client.query('SELECT COUNT(*) as total FROM procedures');
    console.log(`\n✨ Total procedures: ${total.rows[0].total}`);
    
    console.log('\n🎉 Success! Now you can:');
    console.log('   1. Start API server: npm start');
    console.log('   2. View Swagger: http://localhost:8080/api-docs');
    console.log('   3. Test frontend: http://localhost:3000/management/provider-fees');
    
  } catch (error) {
    if (error.code === '42P07') {
      console.log('⚠️  Procedures table already exists!');
      console.log('   Checking existing data...\n');
      
      try {
        const total = await client.query('SELECT COUNT(*) as total FROM procedures');
        const summary = await client.query(`
          SELECT category, COUNT(*) as procedure_count 
          FROM procedures 
          GROUP BY category 
          ORDER BY category
        `);
        
        console.log('📊 Current procedure counts:');
        summary.rows.forEach(row => {
          console.log(`   ${row.category}: ${row.procedure_count} procedures`);
        });
        console.log(`\n✨ Total procedures: ${total.rows[0].total}`);
        
        console.log('\n✅ Database is already set up!');
        console.log('\n   You can now:');
        console.log('   1. Start API server: npm start');
        console.log('   2. View Swagger: http://localhost:8080/api-docs');
        console.log('   3. Test frontend: http://localhost:3000/management/provider-fees');
        
        console.log('\n💡 To recreate the table, run:');
        console.log('   DROP TABLE procedures;');
        console.log('   Then run this script again.');
      } catch (err) {
        console.error('Error checking existing data:', err.message);
      }
    } else if (error.code === '3D000') {
      console.error('❌ Database "dentist_newdb" does not exist!');
      console.error('\n💡 Please create the database first:');
      console.error('   1. Open pgAdmin');
      console.error('   2. Right-click on Databases → Create → Database');
      console.error('   3. Name: dentist_newdb');
      console.error('   4. Owner: dentist (or postgres)');
      console.error('   5. Save');
      console.error('   6. Run this script again');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to PostgreSQL!');
      console.error('\n💡 Make sure PostgreSQL is running:');
      console.error('   1. Open Services (services.msc)');
      console.error('   2. Find "postgresql-x64-18"');
      console.error('   3. Start the service');
      console.error('   4. Run this script again');
    } else if (error.code === '28P01') {
      console.error('❌ Authentication failed!');
      console.error('\n💡 Check your database credentials in api/.env:');
      console.error('   DB_USER=dentist');
      console.error('   DB_PASS=dentist@345');
      console.error('\n   Or update them to match your PostgreSQL setup.');
    } else {
      console.error('❌ Error:', error.message);
      console.error('   Code:', error.code);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
console.log('🚀 Starting procedures table creation...\n');
createProceduresTable();
