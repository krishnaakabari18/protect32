const pool = require('./src/config/database');

async function checkUsers() {
  try {
    // Check users with user_type = 'provider'
    const result = await pool.query("SELECT id, first_name, last_name, email, user_type FROM users WHERE user_type = 'provider' LIMIT 10");
    console.log('\n=== USERS WITH TYPE PROVIDER ===');
    console.log('Count:', result.rows.length);
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.first_name} ${user.last_name}`);
      console.log(`Email: ${user.email}`);
      console.log('---');
    });
    
    // Check all users
    const allUsers = await pool.query("SELECT id, first_name, last_name, email, user_type FROM users LIMIT 10");
    console.log('\n=== ALL USERS (first 10) ===');
    allUsers.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Type: ${user.user_type}`);
    });
    
    // Check existing providers
    const providers = await pool.query('SELECT id FROM providers');
    console.log('\n=== EXISTING PROVIDERS ===');
    console.log('Count:', providers.rows.length);
    providers.rows.forEach(p => console.log('Provider ID:', p.id));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
