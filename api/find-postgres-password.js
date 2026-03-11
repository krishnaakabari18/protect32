const { Pool } = require('pg');

const commonPasswords = [
  'postgres',
  'admin',
  'password',
  'root',
  '123456',
  'postgres123',
  'admin123',
  '',
  'dentist@345'
];

async function testPassword(password) {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password
  });

  try {
    const client = await pool.connect();
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    return false;
  }
}

async function findPassword() {
  console.log('🔍 Searching for postgres password...\n');
  
  for (const pwd of commonPasswords) {
    process.stdout.write(`Testing: "${pwd || '(empty)'}"... `);
    const success = await testPassword(pwd);
    if (success) {
      console.log('✅ SUCCESS!\n');
      console.log('🎉 Found working password for postgres user!');
      console.log(`\nPassword: "${pwd}"`);
      console.log('\nNow run: node setup-database.js');
      console.log('(Update the password in setup-database.js first if needed)');
      return pwd;
    } else {
      console.log('❌');
    }
  }
  
  console.log('\n❌ None of the common passwords worked.\n');
  console.log('Please provide your PostgreSQL postgres password:');
  console.log('You can find it in:');
  console.log('  - Your PostgreSQL installation notes');
  console.log('  - pgAdmin connection settings');
  console.log('  - Or reset it using the instructions in DATABASE_SETUP_INSTRUCTIONS.md');
}

findPassword();
