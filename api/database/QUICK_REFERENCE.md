# Database Quick Reference

## Table Relationships Cheat Sheet

### User → Patient/Provider
```sql
-- Get patient details with user info
SELECT u.*, p.* 
FROM users u 
JOIN patients p ON u.id = p.id 
WHERE u.id = 'user-uuid';

-- Get provider details with user info
SELECT u.*, pr.* 
FROM users u 
JOIN providers pr ON u.id = pr.id 
WHERE u.id = 'user-uuid';
```

### Provider → Schedule & Fees
```sql
-- Get provider with full schedule
SELECT 
    p.*,
    json_agg(ps ORDER BY 
        CASE ps.day_of_week
            WHEN 'monday' THEN 1
            WHEN 'tuesday' THEN 2
            WHEN 'wednesday' THEN 3
            WHEN 'thursday' THEN 4
            WHEN 'friday' THEN 5
            WHEN 'saturday' THEN 6
            WHEN 'sunday' THEN 7
        END
    ) as schedule
FROM providers p
LEFT JOIN provider_schedules ps ON p.id = ps.provider_id
WHERE p.id = 'provider-uuid'
GROUP BY p.id;

-- Get provider fees
SELECT * FROM provider_fees 
WHERE provider_id = 'provider-uuid' 
AND status = 'approved'
ORDER BY procedure;
```

### Appointments
```sql
-- Get upcoming appointments for patient
SELECT 
    a.*,
    u.first_name || ' ' || u.last_name as provider_name,
    pr.clinic_name,
    pr.specialty,
    af.status as form_status
FROM appointments a
JOIN providers pr ON a.provider_id = pr.id
JOIN users u ON pr.id = u.id
LEFT JOIN appointment_forms af ON a.id = af.appointment_id
WHERE a.patient_id = 'patient-uuid'
AND a.status = 'Upcoming'
AND a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date, a.start_time;

-- Get today's appointments for provider
SELECT 
    a.*,
    u.first_name || ' ' || u.last_name as patient_name,
    af.status as form_status
FROM appointments a
JOIN users u ON a.patient_id = u.id
LEFT JOIN appointment_forms af ON a.id = af.appointment_id
WHERE a.provider_id = 'provider-uuid'
AND a.appointment_date = CURRENT_DATE
ORDER BY a.start_time;
```

### Treatment Plans
```sql
-- Get treatment plan with all items
SELECT 
    tp.*,
    json_agg(
        json_build_object(
            'id', tpi.id,
            'procedure', tpi.procedure,
            'fee', tpi.fee,
            'discount_percent', tpi.discount_percent,
            'final_price', tpi.final_price
        )
    ) as items
FROM treatment_plans tp
LEFT JOIN treatment_plan_items tpi ON tp.id = tpi.treatment_plan_id
WHERE tp.id = 'treatment-plan-uuid'
GROUP BY tp.id;

-- Get all treatment plans for patient
SELECT 
    tp.*,
    u.first_name || ' ' || u.last_name as provider_name,
    pr.clinic_name,
    COUNT(tpi.id) as item_count
FROM treatment_plans tp
JOIN providers pr ON tp.provider_id = pr.id
JOIN users u ON pr.id = u.id
LEFT JOIN treatment_plan_items tpi ON tp.id = tpi.treatment_plan_id
WHERE tp.patient_id = 'patient-uuid'
GROUP BY tp.id, u.first_name, u.last_name, pr.clinic_name
ORDER BY tp.created_at DESC;
```

### Chat
```sql
-- Get user's chat rooms with last message
SELECT 
    cr.*,
    (
        SELECT json_build_object(
            'content', cm.content,
            'created_at', cm.created_at,
            'sender_name', u.first_name || ' ' || u.last_name
        )
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.room_id = cr.id
        ORDER BY cm.created_at DESC
        LIMIT 1
    ) as last_message,
    (
        SELECT COUNT(*)
        FROM chat_messages cm
        LEFT JOIN message_read_receipts mrr ON cm.id = mrr.message_id AND mrr.user_id = 'user-uuid'
        WHERE cm.room_id = cr.id
        AND cm.sender_id != 'user-uuid'
        AND mrr.id IS NULL
    ) as unread_count
FROM chat_rooms cr
JOIN chat_participants cp ON cr.id = cp.room_id
WHERE cp.user_id = 'user-uuid'
ORDER BY cr.updated_at DESC;

-- Get messages in a room
SELECT 
    cm.*,
    u.first_name || ' ' || u.last_name as sender_name,
    u.profile_picture as sender_avatar,
    EXISTS(
        SELECT 1 FROM message_read_receipts 
        WHERE message_id = cm.id AND user_id = 'current-user-uuid'
    ) as is_read_by_me
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
WHERE cm.room_id = 'room-uuid'
AND cm.is_deleted = false
ORDER BY cm.created_at ASC
LIMIT 50;
```

### Notifications
```sql
-- Get unread notifications
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
AND is_read = false
ORDER BY created_at DESC;

-- Get notification count by type
SELECT 
    notification_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count
FROM notifications
WHERE user_id = 'user-uuid'
GROUP BY notification_type;
```

### Payments & Settlements
```sql
-- Get payment history for patient
SELECT 
    p.*,
    u.first_name || ' ' || u.last_name as provider_name,
    pr.clinic_name,
    a.service
FROM payments p
JOIN providers pr ON p.provider_id = pr.id
JOIN users u ON pr.id = u.id
LEFT JOIN appointments a ON p.appointment_id = a.id
WHERE p.patient_id = 'patient-uuid'
ORDER BY p.created_at DESC;

-- Get pending settlements for provider
SELECT 
    s.*,
    u.first_name || ' ' || u.last_name as patient_name
FROM settlements s
JOIN users u ON s.patient_id = u.id
WHERE s.provider_id = 'provider-uuid'
AND s.status IN ('Pending Submission', 'Processing')
ORDER BY s.appointment_date DESC;
```

### Plans & Subscriptions
```sql
-- Get active plan for patient
SELECT 
    pp.*,
    p.title,
    p.price,
    p.features,
    p.discount_percent,
    CASE 
        WHEN pp.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN pp.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Active'
    END as plan_health
FROM patient_plans pp
JOIN plans p ON pp.plan_id = p.id
WHERE pp.patient_id = 'patient-uuid'
AND pp.status = 'Active'
ORDER BY pp.expiry_date DESC
LIMIT 1;
```

## Common Operations

### Create User with Patient Profile
```sql
-- Start transaction
BEGIN;

-- Insert user
INSERT INTO users (email, password_hash, mobile_number, first_name, last_name, user_type, mobile_verified)
VALUES ('user@example.com', 'hashed_password', '9876543210', 'John', 'Doe', 'patient', true)
RETURNING id;

-- Insert patient (use returned id)
INSERT INTO patients (id, emergency_contact_name, emergency_contact_number)
VALUES ('returned-user-id', 'Jane Doe', '9876543211');

COMMIT;
```

### Create Appointment with Form
```sql
BEGIN;

-- Create appointment
INSERT INTO appointments (patient_id, provider_id, appointment_date, start_time, end_time, service, status)
VALUES ('patient-uuid', 'provider-uuid', '2024-08-20', '10:00', '10:30', 'Check-up', 'Upcoming')
RETURNING id;

-- Create appointment form
INSERT INTO appointment_forms (appointment_id, status)
VALUES ('returned-appointment-id', 'Pending');

COMMIT;
```

### Update Provider Rating (Automatic via Trigger)
```sql
-- Just insert a review, trigger will update provider rating
INSERT INTO provider_reviews (provider_id, patient_id, appointment_id, rating, comment)
VALUES ('provider-uuid', 'patient-uuid', 'appointment-uuid', 5, 'Excellent service!');

-- Rating and total_reviews in providers table will be updated automatically
```

### Mark Messages as Read
```sql
-- Insert read receipt
INSERT INTO message_read_receipts (message_id, user_id)
SELECT id, 'user-uuid'
FROM chat_messages
WHERE room_id = 'room-uuid'
AND sender_id != 'user-uuid'
AND id NOT IN (
    SELECT message_id FROM message_read_receipts WHERE user_id = 'user-uuid'
)
ON CONFLICT DO NOTHING;
```

## Useful Aggregations

### Provider Statistics
```sql
SELECT 
    p.id,
    u.first_name || ' ' || u.last_name as name,
    p.rating,
    p.total_reviews,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'Completed') as completed_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'Cancelled') as cancelled_appointments,
    COUNT(DISTINCT tp.id) as treatment_plans_created,
    COALESCE(SUM(pay.amount), 0) as total_revenue
FROM providers p
JOIN users u ON p.id = u.id
LEFT JOIN appointments a ON p.id = a.provider_id
LEFT JOIN treatment_plans tp ON p.id = tp.provider_id
LEFT JOIN payments pay ON p.id = pay.provider_id AND pay.status = 'Paid'
WHERE p.id = 'provider-uuid'
GROUP BY p.id, u.first_name, u.last_name;
```

### Patient Statistics
```sql
SELECT 
    pat.id,
    u.first_name || ' ' || u.last_name as name,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'Completed') as completed_appointments,
    COUNT(DISTINCT tp.id) as treatment_plans,
    COUNT(DISTINCT d.id) as documents,
    COUNT(DISTINCT pr.id) as prescriptions,
    COALESCE(SUM(pay.amount), 0) as total_spent
FROM patients pat
JOIN users u ON pat.id = u.id
LEFT JOIN appointments a ON pat.id = a.patient_id
LEFT JOIN treatment_plans tp ON pat.id = tp.patient_id
LEFT JOIN documents d ON pat.id = d.patient_id
LEFT JOIN prescriptions pr ON pat.id = pr.patient_id
LEFT JOIN payments pay ON pat.id = pay.patient_id AND pay.status = 'Paid'
WHERE pat.id = 'patient-uuid'
GROUP BY pat.id, u.first_name, u.last_name;
```

## Performance Tips

1. **Use EXPLAIN ANALYZE** to check query performance
```sql
EXPLAIN ANALYZE
SELECT * FROM appointments WHERE patient_id = 'uuid';
```

2. **Use indexes for WHERE, JOIN, and ORDER BY columns**
```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

3. **Use LIMIT for pagination**
```sql
SELECT * FROM appointments 
ORDER BY appointment_date DESC 
LIMIT 20 OFFSET 0;
```

4. **Use prepared statements** (handled by pg library)
```typescript
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

5. **Batch operations when possible**
```sql
INSERT INTO table_name (col1, col2) 
VALUES ($1, $2), ($3, $4), ($5, $6);
```

## Backup & Restore

### Backup
```bash
# Full database backup
pg_dump -U postgres -d dental_app -F c -f backup.dump

# Schema only
pg_dump -U postgres -d dental_app -s -f schema.sql

# Data only
pg_dump -U postgres -d dental_app -a -f data.sql

# Specific table
pg_dump -U postgres -d dental_app -t users -f users_backup.sql
```

### Restore
```bash
# Restore from custom format
pg_restore -U postgres -d dental_app -c backup.dump

# Restore from SQL file
psql -U postgres -d dental_app -f backup.sql
```

## Maintenance

### Vacuum and Analyze
```sql
-- Vacuum all tables
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE appointments;
```

### Check Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```
