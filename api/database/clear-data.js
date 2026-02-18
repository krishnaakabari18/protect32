require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

async function clearData() {
  const client = await pool.connect();
  
  try {
    console.log('Clearing all data from tables...\n');

    // Delete in reverse order of dependencies
    await client.query('DELETE FROM message_read_receipts');
    await client.query('DELETE FROM chat_messages');
    await client.query('DELETE FROM chat_participants');
    await client.query('DELETE FROM chat_rooms');
    await client.query('DELETE FROM referrals');
    await client.query('DELETE FROM network_providers');
    await client.query('DELETE FROM settlements');
    await client.query('DELETE FROM post_treatment_records');
    await client.query('DELETE FROM appointment_forms');
    await client.query('DELETE FROM admin_forms');
    await client.query('DELETE FROM app_versions');
    await client.query('DELETE FROM treatment_plan_items');
    await client.query('DELETE FROM treatment_plans');
    await client.query('DELETE FROM provider_reviews');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM documents');
    await client.query('DELETE FROM prescriptions');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM patient_plans');
    await client.query('DELETE FROM family_members');
    await client.query('DELETE FROM operatories');
    await client.query('DELETE FROM provider_fees');
    await client.query('DELETE FROM provider_schedules');
    await client.query('DELETE FROM appointments');
    await client.query('DELETE FROM plans');
    await client.query('DELETE FROM patients');
    await client.query('DELETE FROM providers');
    await client.query('DELETE FROM refresh_tokens');
    await client.query('DELETE FROM otp_verifications');
    await client.query('DELETE FROM users');

    console.log('✅ All data cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearData();
