const { Pool } = require('pg');

const passwords = [
  'dentist@345',
  '"dentist@345"',
  'dentist',
  'postgres',
  'admin',
  '123456'
];

async function testPassword(password) {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'dentist_newdb',
    user: 'dentist',
    password: password
  });

  try {
    const client = await pool.connect();
    console.log(`✅ SUCCESS with password: "${password}"`);
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED with password: "${password}"`);
    await pool.end();
    return false;
  }
}

async function testAll() {
  console.log('Testing different passwords for user "dentist"...\n');
  
  for (const pwd of passwords) {
    const success = await testPassword(pwd);
    if (success) {
      console.log(`\n🎉 Found working password: "${pwd}"`);
      console.log('\nUpdate your .env file with:');
      console.log(`DB_PASS=${pwd}`);
      break;
    }
  }
}

testAll();
