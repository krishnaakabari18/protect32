require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting data seeding...\n');

    // 1. Create Users
    console.log('Creating users...');
    const password_hash = await bcrypt.hash('password123', 10);
    
    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, mobile_number, first_name, last_name, user_type, is_active, is_verified, date_of_birth, address)
      VALUES 
        ('admin@dentist.com', $1, '+1234567890', 'Admin', 'User', 'admin', true, true, '1985-01-15', '123 Admin St, New York, NY'),
        ('dr.smith@dentist.com', $1, '+1234567891', 'John', 'Smith', 'provider', true, true, '1980-05-20', '456 Provider Ave, Los Angeles, CA'),
        ('dr.jones@dentist.com', $1, '+1234567892', 'Sarah', 'Jones', 'provider', true, true, '1982-08-10', '789 Dental Blvd, Chicago, IL'),
        ('patient1@example.com', $1, '+1234567893', 'Michael', 'Johnson', 'patient', true, true, '1990-03-25', '321 Patient Rd, Houston, TX'),
        ('patient2@example.com', $1, '+1234567894', 'Emily', 'Davis', 'patient', true, true, '1995-07-12', '654 Health St, Phoenix, AZ')
      RETURNING id, email, user_type
    `, [password_hash]);
    
    const users = usersResult.rows;
    console.log(`✓ Created ${users.length} users`);

    const adminId = users.find(u => u.user_type === 'admin').id;
    const provider1Id = users.find(u => u.email === 'dr.smith@dentist.com').id;
    const provider2Id = users.find(u => u.email === 'dr.jones@dentist.com').id;
    const patient1Id = users.find(u => u.email === 'patient1@example.com').id;
    const patient2Id = users.find(u => u.email === 'patient2@example.com').id;

    // 2. Create Providers
    console.log('Creating providers...');
    await client.query(`
      INSERT INTO providers (id, specialty, experience_years, clinic_name, contact_number, location, about, rating, total_reviews, availability)
      VALUES 
        ($1, 'Orthodontics', 15, 'Smith Dental Clinic', '+1234567891', 'Los Angeles, CA', 'Specialized in braces and aligners', 4.8, 120, 'Mon-Fri 9AM-5PM'),
        ($2, 'Endodontics', 12, 'Jones Root Canal Center', '+1234567892', 'Chicago, IL', 'Expert in root canal treatments', 4.9, 95, 'Mon-Sat 8AM-6PM')
    `, [provider1Id, provider2Id]);
    console.log('✓ Created 2 providers');

    // 3. Create Patients
    console.log('Creating patients...');
    await client.query(`
      INSERT INTO patients (id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number)
      VALUES 
        ($1, 'Jane Johnson', '+1234567895', 'Blue Cross', 'BC123456'),
        ($2, 'Robert Davis', '+1234567896', 'Aetna', 'AE789012')
    `, [patient1Id, patient2Id]);
    console.log('✓ Created 2 patients');

    // 4. Create Plans
    console.log('Creating plans...');
    const plansResult = await client.query(`
      INSERT INTO plans (title, price, features, is_popular, max_members, discount_percent, free_checkups_annually, free_cleanings_annually, free_xrays_annually)
      VALUES 
        ('Basic Plan', 29.99, ARRAY['1 Free Checkup', '10% Discount', 'Emergency Support'], false, 1, 10, 1, 0, 0),
        ('Family Plan', 79.99, ARRAY['2 Free Checkups', '20% Discount', 'Priority Booking', 'Family Coverage'], true, 4, 20, 2, 1, 1),
        ('Premium Plan', 149.99, ARRAY['4 Free Checkups', '30% Discount', 'VIP Support', 'Unlimited Family'], false, 10, 30, 4, 2, 2)
      RETURNING id, title
    `);
    console.log(`✓ Created ${plansResult.rows.length} plans`);

    // 5. Create Appointments
    console.log('Creating appointments...');
    const appointmentsResult = await client.query(`
      INSERT INTO appointments (patient_id, provider_id, appointment_date, start_time, end_time, service, status, notes)
      VALUES 
        ($1, $2, '2026-03-15', '10:00:00', '11:00:00', 'Regular Checkup', 'Upcoming', 'First visit'),
        ($1, $2, '2026-02-10', '14:00:00', '15:00:00', 'Teeth Cleaning', 'Completed', 'Routine cleaning'),
        ($3, $4, '2026-03-20', '09:00:00', '10:30:00', 'Root Canal', 'Upcoming', 'Follow-up needed'),
        ($3, $4, '2026-01-15', '11:00:00', '12:00:00', 'Consultation', 'Completed', 'Initial consultation')
      RETURNING id
    `, [patient1Id, provider1Id, patient2Id, provider2Id]);
    console.log(`✓ Created ${appointmentsResult.rows.length} appointments`);

    // 6. Create Payments
    console.log('Creating payments...');
    await client.query(`
      INSERT INTO payments (patient_id, provider_id, appointment_id, amount, payment_method, transaction_id, status, payment_date)
      VALUES 
        ($1, $2, $3, 150.00, 'credit_card', 'TXN001', 'Paid', NOW() - INTERVAL '30 days'),
        ($4, $5, $6, 250.00, 'debit_card', 'TXN002', 'Paid', NOW() - INTERVAL '15 days')
    `, [patient1Id, provider1Id, appointmentsResult.rows[1].id, patient2Id, provider2Id, appointmentsResult.rows[3].id]);
    console.log('✓ Created 2 payments');

    // 7. Create Prescriptions
    console.log('Creating prescriptions...');
    await client.query(`
      INSERT INTO prescriptions (patient_id, provider_id, appointment_id, medication, dosage, refills_left, date_prescribed)
      VALUES 
        ($1, $2, $3, 'Amoxicillin', '500mg, 3 times daily for 7 days', 0, '2026-02-10'),
        ($4, $5, $6, 'Ibuprofen', '400mg, as needed for pain', 2, '2026-01-15')
    `, [patient1Id, provider1Id, appointmentsResult.rows[1].id, patient2Id, provider2Id, appointmentsResult.rows[3].id]);
    console.log('✓ Created 2 prescriptions');

    // 8. Create Documents
    console.log('Creating documents...');
    await client.query(`
      INSERT INTO documents (patient_id, uploaded_by, name, document_type, file_url, file_size, mime_type)
      VALUES 
        ($1, $2, 'X-Ray_2026-02-10.jpg', 'X-Ray', 'https://example.com/xrays/patient1_xray1.jpg', 2048576, 'image/jpeg'),
        ($3, $4, 'Treatment_Plan.pdf', 'Treatment Plan', 'https://example.com/plans/patient2_plan1.pdf', 512000, 'application/pdf')
    `, [patient1Id, provider1Id, patient2Id, provider2Id]);
    console.log('✓ Created 2 documents');

    // 9. Create Notifications
    console.log('Creating notifications...');
    await client.query(`
      INSERT INTO notifications (user_id, notification_type, title, message, is_read, related_appointment_id)
      VALUES 
        ($1, 'APPOINTMENT_REMINDER', 'Upcoming Appointment', 'You have an appointment tomorrow at 10:00 AM', false, $2),
        ($3, 'REVIEW_REQUEST', 'Review Your Visit', 'Please review your recent visit with Dr. Jones', false, $4),
        ($1, 'PAYMENT_REQUEST', 'Payment Due', 'Your payment of $150 is due', true, NULL)
    `, [patient1Id, appointmentsResult.rows[0].id, patient2Id, appointmentsResult.rows[3].id]);
    console.log('✓ Created 3 notifications');

    // 10. Create Reviews
    console.log('Creating reviews...');
    await client.query(`
      INSERT INTO provider_reviews (provider_id, patient_id, appointment_id, rating, comment)
      VALUES 
        ($1, $2, $3, 5, 'Excellent service! Very professional and caring.'),
        ($4, $5, $6, 4, 'Good experience, would recommend.')
    `, [provider1Id, patient1Id, appointmentsResult.rows[1].id, provider2Id, patient2Id, appointmentsResult.rows[3].id]);
    console.log('✓ Created 2 reviews');

    // 11. Create Treatment Plans
    console.log('Creating treatment plans...');
    const treatmentPlansResult = await client.query(`
      INSERT INTO treatment_plans (patient_id, provider_id, appointment_id, status, total_estimate)
      VALUES 
        ($1, $2, $3, 'Proposed', 1500.00),
        ($4, $5, $6, 'Consented', 2500.00)
      RETURNING id
    `, [patient1Id, provider1Id, appointmentsResult.rows[0].id, patient2Id, provider2Id, appointmentsResult.rows[2].id]);
    console.log(`✓ Created ${treatmentPlansResult.rows.length} treatment plans`);

    // 12. Create Treatment Plan Items
    console.log('Creating treatment plan items...');
    await client.query(`
      INSERT INTO treatment_plan_items (treatment_plan_id, procedure, fee, discount_percent, final_price, notes)
      VALUES 
        ($1, 'Teeth Whitening', 500.00, 10, 450.00, 'Professional whitening treatment'),
        ($1, 'Cavity Filling', 300.00, 10, 270.00, '2 cavities'),
        ($2, 'Root Canal', 1500.00, 20, 1200.00, 'Molar root canal'),
        ($2, 'Crown Placement', 1000.00, 20, 800.00, 'Porcelain crown')
    `, [treatmentPlansResult.rows[0].id, treatmentPlansResult.rows[1].id]);
    console.log('✓ Created 4 treatment plan items');

    // 13. Create Provider Schedules
    console.log('Creating provider schedules...');
    await client.query(`
      INSERT INTO provider_schedules (provider_id, day_of_week, is_active, morning_active, morning_start_time, morning_end_time, afternoon_active, afternoon_start_time, afternoon_end_time)
      VALUES 
        ($1, 'monday', true, true, '09:00', '12:00', true, '13:00', '17:00'),
        ($1, 'tuesday', true, true, '09:00', '12:00', true, '13:00', '17:00'),
        ($1, 'wednesday', true, true, '09:00', '12:00', true, '13:00', '17:00'),
        ($2, 'monday', true, true, '08:00', '12:00', true, '13:00', '18:00'),
        ($2, 'tuesday', true, true, '08:00', '12:00', true, '13:00', '18:00')
    `, [provider1Id, provider2Id]);
    console.log('✓ Created 5 provider schedules');

    // 14. Create Provider Fees
    console.log('Creating provider fees...');
    await client.query(`
      INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status)
      VALUES 
        ($1, 'Regular Checkup', 100.00, 10, 'approved'),
        ($1, 'Teeth Cleaning', 150.00, 10, 'approved'),
        ($1, 'Teeth Whitening', 500.00, 10, 'approved'),
        ($2, 'Root Canal', 1500.00, 20, 'approved'),
        ($2, 'Crown Placement', 1000.00, 20, 'approved')
    `, [provider1Id, provider2Id]);
    console.log('✓ Created 5 provider fees');

    // 15. Create Operatories
    console.log('Creating operatories...');
    await client.query(`
      INSERT INTO operatories (provider_id, name, doctor_name, is_active)
      VALUES 
        ($1, 'Room 1', 'Dr. John Smith', true),
        ($1, 'Room 2', 'Dr. John Smith', true),
        ($2, 'Room A', 'Dr. Sarah Jones', true)
    `, [provider1Id, provider2Id]);
    console.log('✓ Created 3 operatories');

    // 16. Create Family Members
    console.log('Creating family members...');
    await client.query(`
      INSERT INTO family_members (patient_id, first_name, last_name, relationship, mobile_number, date_of_birth)
      VALUES 
        ($1, 'Jane', 'Johnson', 'Spouse', '+1234567897', '1992-05-15'),
        ($1, 'Tommy', 'Johnson', 'Son', '+1234567898', '2015-08-20')
    `, [patient1Id]);
    console.log('✓ Created 2 family members');

    // 17. Create Patient Plans
    console.log('Creating patient plans...');
    await client.query(`
      INSERT INTO patient_plans (patient_id, plan_id, status, start_date, expiry_date, auto_renew)
      VALUES 
        ($1, $2, 'Active', '2026-01-01', '2026-12-31', true),
        ($3, $4, 'Active', '2026-02-01', '2027-01-31', true)
    `, [patient1Id, plansResult.rows[1].id, patient2Id, plansResult.rows[0].id]);
    console.log('✓ Created 2 patient plans');

    // 18. Create Chat Rooms
    console.log('Creating chat rooms...');
    const chatRoomsResult = await client.query(`
      INSERT INTO chat_rooms (room_type, name, created_by)
      VALUES 
        ('direct', 'Patient-Provider Chat', $1),
        ('support', 'Support Chat', $2)
      RETURNING id
    `, [patient1Id, patient2Id]);
    console.log(`✓ Created ${chatRoomsResult.rows.length} chat rooms`);

    // 19. Create Chat Participants
    console.log('Creating chat participants...');
    await client.query(`
      INSERT INTO chat_participants (room_id, user_id)
      VALUES 
        ($1, $2),
        ($1, $3),
        ($4, $5),
        ($4, $6)
    `, [chatRoomsResult.rows[0].id, patient1Id, provider1Id, chatRoomsResult.rows[1].id, patient2Id, adminId]);
    console.log('✓ Created 4 chat participants');

    // 20. Create Chat Messages
    console.log('Creating chat messages...');
    await client.query(`
      INSERT INTO chat_messages (room_id, sender_id, message_type, content)
      VALUES 
        ($1, $2, 'text', 'Hello Dr. Smith, I have a question about my appointment.'),
        ($1, $3, 'text', 'Hello Michael! How can I help you?'),
        ($4, $5, 'text', 'I need help with my insurance claim.'),
        ($4, $6, 'text', 'Sure, I can help you with that.')
    `, [chatRoomsResult.rows[0].id, patient1Id, provider1Id, chatRoomsResult.rows[1].id, patient2Id, adminId]);
    console.log('✓ Created 4 chat messages');

    // 21. Create Network Providers
    console.log('Creating network providers...');
    const networkProvidersResult = await client.query(`
      INSERT INTO network_providers (name, provider_type, specialty, contact_number, email, address, is_active)
      VALUES 
        ('City Radiology Center', 'Radiology Center', 'Dental X-Rays', '+1234567899', 'info@cityradiology.com', '100 Medical Plaza, NY', true),
        ('Advanced Dental Lab', 'Lab', 'Dental Prosthetics', '+1234567800', 'lab@advanceddental.com', '200 Lab Street, CA', true)
      RETURNING id
    `);
    console.log(`✓ Created ${networkProvidersResult.rows.length} network providers`);

    // 22. Create Referrals
    console.log('Creating referrals...');
    await client.query(`
      INSERT INTO referrals (patient_id, appointment_id, from_provider_id, to_provider_id, reason, status, notes)
      VALUES 
        ($1, $2, $3, $4, 'Specialized root canal treatment needed', 'Sent', 'Complex case requiring specialist'),
        ($5, $6, $7, $8, 'X-ray imaging required', 'Completed', 'Standard dental x-rays')
    `, [patient1Id, appointmentsResult.rows[0].id, provider1Id, networkProvidersResult.rows[1].id, 
        patient2Id, appointmentsResult.rows[2].id, provider2Id, networkProvidersResult.rows[0].id]);
    console.log('✓ Created 2 referrals');

    // 23. Create App Versions
    console.log('Creating app versions...');
    await client.query(`
      INSERT INTO app_versions (platform, version_number, build_number, min_supported_version, force_update, update_priority, release_notes, is_active)
      VALUES 
        ('ios', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release', true),
        ('android', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release', true),
        ('web', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release', true)
    `);
    console.log('✓ Created 3 app versions');

    // 24. Create Admin Forms
    console.log('Creating admin forms...');
    await client.query(`
      INSERT INTO admin_forms (user_id, form_type, status, form_data)
      VALUES 
        ($1, 'Self-assessment', 'Completed', '{"questions": ["Q1", "Q2"], "answers": ["A1", "A2"]}'),
        ($2, 'Declaration', 'Pending', '{"declaration": "I agree to terms"}')
    `, [patient1Id, patient2Id]);
    console.log('✓ Created 2 admin forms');

    // 25. Create Appointment Forms
    console.log('Creating appointment forms...');
    await client.query(`
      INSERT INTO appointment_forms (appointment_id, status, allergies, medications, medical_conditions, last_dental_visit, dental_issues, dental_habits, consent_given, submission_date)
      VALUES 
        ($1, 'Completed', 'Penicillin', 'Blood pressure medication', ARRAY['Hypertension'], '2025-06-15', 'Tooth sensitivity', ARRAY['Brushing twice daily', 'Flossing'], true, NOW() - INTERVAL '5 days'),
        ($2, 'Pending', 'None', 'None', ARRAY[]::text[], '2024-12-01', 'None', ARRAY['Brushing twice daily'], false, NULL)
    `, [appointmentsResult.rows[1].id, appointmentsResult.rows[0].id]);
    console.log('✓ Created 2 appointment forms');

    // 26. Create Post Treatment Records
    console.log('Creating post treatment records...');
    await client.query(`
      INSERT INTO post_treatment_records (appointment_id, patient_id, provider_id, plaque_index, gum_health, cavity_risk, notes)
      VALUES 
        ($1, $2, $3, 'Good', 'Healthy', 'Low', 'Excellent oral hygiene maintained'),
        ($4, $5, $6, 'Fair', 'Gingivitis', 'Medium', 'Recommend more frequent flossing')
    `, [appointmentsResult.rows[1].id, patient1Id, provider1Id, appointmentsResult.rows[3].id, patient2Id, provider2Id]);
    console.log('✓ Created 2 post treatment records');

    // 27. Create Settlements
    console.log('Creating settlements...');
    await client.query(`
      INSERT INTO settlements (provider_id, patient_id, appointment_id, service, appointment_date, settlement_amount, status, submitted_date)
      VALUES 
        ($1, $2, $3, 'Teeth Cleaning', '2026-02-10', 150.00, 'Settled', NOW() - INTERVAL '20 days'),
        ($4, $5, $6, 'Consultation', '2026-01-15', 100.00, 'Processing', NOW() - INTERVAL '10 days')
    `, [provider1Id, patient1Id, appointmentsResult.rows[1].id, provider2Id, patient2Id, appointmentsResult.rows[3].id]);
    console.log('✓ Created 2 settlements');

    console.log('\n✅ All dummy data inserted successfully!');
    console.log('\nSummary:');
    console.log('- 5 Users (1 admin, 2 providers, 2 patients)');
    console.log('- 2 Providers with details');
    console.log('- 2 Patients with details');
    console.log('- 3 Plans');
    console.log('- 4 Appointments');
    console.log('- 2 Payments');
    console.log('- 2 Prescriptions');
    console.log('- 2 Documents');
    console.log('- 3 Notifications');
    console.log('- 2 Reviews');
    console.log('- 2 Treatment Plans with 4 items');
    console.log('- 5 Provider Schedules');
    console.log('- 5 Provider Fees');
    console.log('- 3 Operatories');
    console.log('- 2 Family Members');
    console.log('- 2 Patient Plans');
    console.log('- 2 Chat Rooms with 4 participants and 4 messages');
    console.log('- 2 Network Providers');
    console.log('- 2 Referrals');
    console.log('- 3 App Versions');
    console.log('- 2 Admin Forms');
    console.log('- 2 Appointment Forms');
    console.log('- 2 Post Treatment Records');
    console.log('- 2 Settlements');
    
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@dentist.com / password123');
    console.log('Provider 1: dr.smith@dentist.com / password123');
    console.log('Provider 2: dr.jones@dentist.com / password123');
    console.log('Patient 1: patient1@example.com / password123');
    console.log('Patient 2: patient2@example.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
