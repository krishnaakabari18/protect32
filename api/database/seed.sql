-- PostgreSQL Seed Data for Dental Application
-- Sample data for testing and development

-- ============================================
-- SEED USERS
-- ============================================

-- Insert sample patients
INSERT INTO users (id, email, password_hash, mobile_number, mobile_verified, first_name, last_name, user_type, is_verified, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'parth@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543210', true, 'Parth', 'Thakkar', 'patient', true, true),
('22222222-2222-2222-2222-222222222222', 'rohan@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543211', true, 'Rohan', 'Gupta', 'patient', true, true),
('33333333-3333-3333-3333-333333333333', 'sneha@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543212', true, 'Sneha', 'Verma', 'patient', true, true);

-- Insert sample providers
INSERT INTO users (id, email, password_hash, mobile_number, mobile_verified, first_name, last_name, user_type, is_verified, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.patel@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543220', true, 'Aarav', 'Patel', 'provider', true, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dr.sharma@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543221', true, 'Priya', 'Sharma', 'provider', true, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dr.desai@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543222', true, 'Rohan', 'Desai', 'provider', true, true);

-- Insert admin user
INSERT INTO users (id, email, password_hash, mobile_number, mobile_verified, first_name, last_name, user_type, is_verified, is_active) VALUES
('99999999-9999-9999-9999-999999999999', 'admin@protect32.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', '9876543299', true, 'Admin', 'User', 'admin', true, true);

-- ============================================
-- SEED PATIENTS
-- ============================================

INSERT INTO patients (id, emergency_contact_name, emergency_contact_number, insurance_provider, insurance_policy_number) VALUES
('11111111-1111-1111-1111-111111111111', 'Rajesh Thakkar', '9876543200', 'Star Health Insurance', 'SH123456789'),
('22222222-2222-2222-2222-222222222222', 'Amit Gupta', '9876543201', 'HDFC ERGO', 'HE987654321'),
('33333333-3333-3333-3333-333333333333', 'Priya Verma', '9876543202', 'ICICI Lombard', 'IL456789123');

-- ============================================
-- SEED PROVIDERS
-- ============================================

INSERT INTO providers (id, specialty, experience_years, clinic_name, contact_number, location, coordinates, about, rating, total_reviews, availability) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Orthodontics', 15, 'Smile Aligners', '9876543220', 'Ahmedabad, Gujarat', '{"lat": 23.0225, "lng": 72.5714}', 'Specializes in modern alignment techniques for all ages.', 4.8, 25, 'Mon-Fri, 9am-6pm'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pediatric Dentistry', 10, 'Happy Kids Dental', '9876543221', 'Gandhinagar, Gujarat', '{"lat": 23.2156, "lng": 72.6369}', 'Creating a comfortable and fun dental experience for children.', 4.9, 30, 'Tue-Sat, 10am-7pm'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Endodontics', 8, 'Root Canal Experts', '9876543222', 'Ahmedabad, Gujarat', '{"lat": 23.0325, "lng": 72.5814}', 'Painless root canal treatments using advanced technology.', 4.6, 18, 'Mon-Sat, 9am-5pm');

-- ============================================
-- SEED PROVIDER SCHEDULES
-- ============================================

-- Schedule for Dr. Aarav Patel
INSERT INTO provider_schedules (provider_id, day_of_week, is_active, morning_active, morning_start_time, morning_end_time, afternoon_active, afternoon_start_time, afternoon_end_time, evening_active, evening_start_time, evening_end_time) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'monday', true, true, '09:00', '12:00', true, '13:00', '17:00', false, '17:00', '21:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tuesday', true, true, '09:00', '12:00', true, '13:00', '17:00', false, '17:00', '21:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'wednesday', true, true, '09:00', '12:00', true, '13:00', '17:00', false, '17:00', '21:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'thursday', true, true, '09:00', '12:00', true, '13:00', '17:00', false, '17:00', '21:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'friday', true, true, '09:00', '12:00', true, '13:00', '17:00', true, '17:00', '20:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'saturday', true, true, '10:00', '14:00', false, '12:00', '16:00', false, '16:00', '20:00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sunday', false, false, '10:00', '14:00', false, '12:00', '16:00', false, '16:00', '20:00');

-- ============================================
-- SEED PROVIDER FEES
-- ============================================

INSERT INTO provider_fees (provider_id, procedure, fee, discount_percent, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Initial Check-up', 1000.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Teeth Cleaning & Polishing', 1800.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dental X-Ray (IOPA)', 500.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tooth Filling (Composite)', 2500.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Root Canal Treatment (RCT)', 6500.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dental Crown (Zirconia/Porcelain)', 10500.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wisdom Tooth Extraction', 5000.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Metal Braces', 45000.00, 0, 'approved'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Teeth Whitening (In-Office)', 10000.00, 0, 'approved');

-- ============================================
-- SEED PLANS
-- ============================================

INSERT INTO plans (title, price, features, is_popular, max_members, discount_percent, free_checkups_annually, free_cleanings_annually, free_xrays_annually, color_scheme) VALUES
('Starter Plan', 299.00, ARRAY['1 Free General Check-up Annually', 'Digital Prescription Access', '5% Discount on all treatments'], false, 1, 5, 1, 0, 0, '{"bg": "bg-orange-200", "buttonBg": "bg-orange-400", "buttonHoverBg": "hover:bg-orange-500", "textColor": "text-orange-900", "buttonTextColor": "text-white"}'),
('Basic Plan', 799.00, ARRAY['2 Free General Check-ups Annually', '1 Free Teeth Cleaning Session', '15% Discount on all treatments', 'Priority Appointment Booking', 'Includes 1 Member'], false, 1, 15, 2, 1, 0, '{"bg": "bg-blue-200", "buttonBg": "bg-blue-400", "buttonHoverBg": "hover:bg-blue-500", "textColor": "text-blue-900", "buttonTextColor": "text-white"}'),
('Preventive Plan', 1299.00, ARRAY['4 Free General Check-ups Annually', '2 Free Teeth Cleaning Sessions', '1 Free Dental X-Ray Annually (if required)', '25% Discount on all treatments', 'Priority Appointment Booking', 'Includes 2 Members'], true, 2, 25, 4, 2, 1, '{"bg": "bg-emerald-200", "buttonBg": "bg-emerald-400", "buttonHoverBg": "hover:bg-emerald-500", "textColor": "text-emerald-900", "buttonTextColor": "text-white"}'),
('Premium Plan', 1799.00, ARRAY['Unlimited General Check-ups', '4 Free Teeth Cleaning Sessions Annually', '35% Discount on all treatments', '1 Free Minor Procedure Included (e.g., filling)', 'Includes up to 4 Members'], false, 4, 35, 999, 4, 0, '{"bg": "bg-indigo-200", "buttonBg": "bg-indigo-400", "buttonHoverBg": "hover:bg-indigo-500", "textColor": "text-indigo-900", "buttonTextColor": "text-white"}');

-- ============================================
-- SEED APPOINTMENTS
-- ============================================

INSERT INTO appointments (id, patient_id, provider_id, appointment_date, start_time, end_time, service, status) VALUES
('app00001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-08-20', '10:00', '10:30', 'Orthodontic Adjustment', 'Upcoming'),
('app00002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-06-15', '14:30', '15:15', 'General Check-up & Cleaning', 'Completed'),
('app00003-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, '09:00', '09:45', 'Orthodontic Check-up', 'Upcoming'),
('app00004-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, '10:30', '11:15', 'Invisalign Fitting', 'Upcoming');

-- ============================================
-- SEED APPOINTMENT FORMS
-- ============================================

INSERT INTO appointment_forms (appointment_id, status, allergies, medications, medical_conditions, last_dental_visit, dental_issues, dental_habits, consent_given, submission_date) VALUES
('app00002-0000-0000-0000-000000000002', 'Completed', 'Penicillin', 'None', ARRAY['None'], '2023-12-15', 'Routine cleaning needed', ARRAY['Brushing twice daily', 'Flossing'], true, '2024-06-14 10:00:00'),
('app00001-0000-0000-0000-000000000001', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL);

-- ============================================
-- SEED TREATMENT PLANS
-- ============================================

INSERT INTO treatment_plans (id, patient_id, provider_id, status, total_estimate, created_at) VALUES
('tp000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Proposed', 15300.00, '2024-07-28 10:00:00'),
('tp000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consented', 2000.00, '2024-07-20 14:30:00');

-- ============================================
-- SEED TREATMENT PLAN ITEMS
-- ============================================

INSERT INTO treatment_plan_items (treatment_plan_id, procedure, fee, discount_percent, final_price) VALUES
('tp000001-0000-0000-0000-000000000001', 'Root Canal Treatment (RCT)', 6500.00, 10, 5850.00),
('tp000001-0000-0000-0000-000000000001', 'Dental Crown (Zirconia/Porcelain)', 10500.00, 10, 9450.00),
('tp000002-0000-0000-0000-000000000002', 'Teeth Cleaning & Polishing', 2000.00, 0, 2000.00);

-- ============================================
-- SEED PROVIDER REVIEWS
-- ============================================

INSERT INTO provider_reviews (provider_id, patient_id, appointment_id, rating, comment, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'app00002-0000-0000-0000-000000000002', 5, 'Dr. Patel is fantastic! My braces journey was smooth and the results are amazing.', '2024-06-16 10:00:00'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', NULL, 5, 'Dr. Sharma is a magician with kids. My daughter is no longer afraid of the dentist!', '2024-07-01 15:30:00');

-- ============================================
-- SEED NOTIFICATIONS
-- ============================================

INSERT INTO notifications (user_id, notification_type, title, message, is_read, related_appointment_id, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'REVIEW_REQUEST', 'How was your visit with Dr. Priya Sharma?', 'We''d love to hear your feedback. Leaving a review helps other patients make informed decisions.', false, 'app00002-0000-0000-0000-000000000002', '2024-06-16 09:00:00'),
('11111111-1111-1111-1111-111111111111', 'GENERAL_INFO', 'Welcome to Protect32!', 'You can now search for dentists, book appointments, and manage your dental health all in one place.', true, NULL, '2024-03-01 10:00:00'),
('11111111-1111-1111-1111-111111111111', 'APPOINTMENT_REMINDER', 'Appointment Reminder', 'You have an appointment with Dr. Aarav Patel tomorrow at 10:00 AM', false, 'app00001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP);

-- ============================================
-- SEED DOCUMENTS
-- ============================================

INSERT INTO documents (patient_id, uploaded_by, name, document_type, file_url, upload_date) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Dental X-Ray - May 2023.jpg', 'X-Ray', 'https://example.com/documents/xray-123.jpg', '2023-05-20 14:30:00'),
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Insurance Policy.pdf', 'Insurance', 'https://example.com/documents/insurance-456.pdf', '2024-01-10 09:00:00');

-- ============================================
-- SEED PRESCRIPTIONS
-- ============================================

INSERT INTO prescriptions (patient_id, provider_id, appointment_id, medication, dosage, refills_left, date_prescribed) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'app00002-0000-0000-0000-000000000002', 'Amoxicillin 500mg', '1 capsule every 8 hours for 7 days', 0, '2024-06-15'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'app00002-0000-0000-0000-000000000002', 'Ibuprofen 400mg', 'As needed for pain', 2, '2024-06-15');

-- ============================================
-- SEED CHAT ROOMS
-- ============================================

INSERT INTO chat_rooms (id, room_type, name, created_by) VALUES
('chat0001-0000-0000-0000-000000000001', 'direct', 'Parth & Dr. Patel', '11111111-1111-1111-1111-111111111111'),
('chat0002-0000-0000-0000-000000000002', 'support', 'Support Chat', '11111111-1111-1111-1111-111111111111');

-- ============================================
-- SEED CHAT PARTICIPANTS
-- ============================================

INSERT INTO chat_participants (room_id, user_id) VALUES
('chat0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
('chat0001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('chat0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
('chat0002-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999');

-- ============================================
-- SEED CHAT MESSAGES
-- ============================================

INSERT INTO chat_messages (room_id, sender_id, message_type, content, created_at) VALUES
('chat0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'text', 'Hello Dr. Patel, I have a question about my upcoming appointment.', '2024-08-15 10:00:00'),
('chat0001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'text', 'Hi Parth! Of course, how can I help you?', '2024-08-15 10:05:00'),
('chat0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'text', 'Should I avoid eating anything before the appointment?', '2024-08-15 10:07:00'),
('chat0001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'text', 'No special preparation needed. Just brush your teeth as usual before coming in.', '2024-08-15 10:10:00');

-- ============================================
-- SEED APP VERSIONS
-- ============================================

INSERT INTO app_versions (platform, version_number, build_number, min_supported_version, force_update, update_priority, release_notes, is_active) VALUES
('android', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release of Protect32 app', true),
('ios', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release of Protect32 app', true),
('web', '1.0.0', 1, '1.0.0', false, 'low', 'Initial release of Protect32 web app', true),
('android', '1.1.0', 2, '1.0.0', false, 'medium', 'Bug fixes and performance improvements', true),
('ios', '1.1.0', 2, '1.0.0', false, 'medium', 'Bug fixes and performance improvements', true);

-- ============================================
-- SEED NETWORK PROVIDERS
-- ============================================

INSERT INTO network_providers (name, provider_type, specialty, contact_number, email, address) VALUES
('Advanced Dental Lab', 'Lab', 'Dental Prosthetics', '9876543250', 'info@advanceddentallab.com', 'Ahmedabad, Gujarat'),
('Gujarat Radiology Center', 'Radiology Center', 'Dental Imaging', '9876543251', 'contact@gujaratradiology.com', 'Gandhinagar, Gujarat'),
('Dr. Specialist Oral Surgeon', 'Specialist', 'Oral Surgery', '9876543252', 'dr.specialist@example.com', 'Ahmedabad, Gujarat');

-- ============================================
-- SEED FAMILY MEMBERS
-- ============================================

INSERT INTO family_members (patient_id, first_name, last_name, relationship, mobile_number, date_of_birth) VALUES
('11111111-1111-1111-1111-111111111111', 'Riya', 'Thakkar', 'Daughter', '9876543260', '2015-05-10'),
('11111111-1111-1111-1111-111111111111', 'Neha', 'Thakkar', 'Spouse', '9876543261', '1992-08-15');

-- ============================================
-- SEED OPERATORIES
-- ============================================

INSERT INTO operatories (provider_id, name, doctor_name, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Operatory 1', 'Dr. Aarav Patel', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Operatory 2', 'Dr. Assistant', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Operatory 1', 'Dr. Priya Sharma', true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify data insertion
SELECT 'Users created: ' || COUNT(*) FROM users;
SELECT 'Providers created: ' || COUNT(*) FROM providers;
SELECT 'Patients created: ' || COUNT(*) FROM patients;
SELECT 'Appointments created: ' || COUNT(*) FROM appointments;
SELECT 'Plans created: ' || COUNT(*) FROM plans;
SELECT 'Chat rooms created: ' || COUNT(*) FROM chat_rooms;
SELECT 'Chat messages created: ' || COUNT(*) FROM chat_messages;
