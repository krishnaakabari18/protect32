-- ========================================
-- SIMPLE FIX: Show All Menus for Super Admin
-- ========================================
-- Just copy and paste this entire script into pgAdmin and run it

-- Step 1: Check current user types (for information)
SELECT 'Current user types in database:' as info;
SELECT DISTINCT user_type, COUNT(*) as count
FROM users
GROUP BY user_type;

-- Step 2: Insert all menus (will skip if already exist)
INSERT INTO menus (name, label, path, icon, sort_order, is_active) VALUES
    ('users', 'Users', '/management/users', 'IconMenuUsers', 1, true),
    ('patients', 'Patients', '/management/patients', 'IconUser', 2, true),
    ('providers', 'Providers', '/management/providers', 'IconUser', 3, true),
    ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true),
    ('procedures', 'Procedures', '/management/procedures', 'IconClipboardText', 5, true),
    ('appointments', 'Appointments', '/management/appointments', 'IconCalendar', 6, true),
    ('treatment-plans', 'Treatment Plans', '/management/treatment-plans', 'IconNotes', 7, true),
    ('prescriptions', 'Prescriptions', '/management/prescriptions', 'IconFile', 8, true),
    ('plans', 'Plans', '/management/plans', 'IconTag', 9, true),
    ('provider-fees', 'Treatment Fees', '/management/provider-fees', 'IconClipboardText', 10, true),
    ('payments', 'Orders', '/management/payments', 'IconCreditCard', 11, true),
    ('documents', 'Documents', '/management/documents', 'IconFile', 12, true),
    ('reviews', 'Reviews', '/management/reviews', 'IconStar', 13, true),
    ('notifications', 'Notifications', '/management/notifications', 'IconBell', 14, true),
    ('support-tickets', 'Support Tickets', '/management/support-tickets', 'IconHelp', 15, true),
    ('settings', 'Settings', '/management/settings', 'IconSettings', 16, true),
    ('cms-pages', 'CMS Pages', '/management/cms-pages', 'IconFile', 17, true),
    ('faqs', 'FAQs', '/management/faqs', 'IconFile', 18, true),
    ('patienteducation', 'Patient Education', '/management/patienteducation', 'IconNotes', 19, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Step 3: Grant permissions to Admin users (NOT Super Admin - they don't need it)
-- This works with any variation: 'Admin', 'admin', 'ADMIN'
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE LOWER(REPLACE(u.user_type, ' ', '_')) = 'admin' 
  AND m.is_active = true
ON CONFLICT (user_id, menu_id) DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;

-- Verification
SELECT '========================================' as info;
SELECT '✅ FIX COMPLETE!' as info;
SELECT '========================================' as info;

SELECT 'User Types (kept as-is):' as info;
SELECT user_type, COUNT(*) as count
FROM users
GROUP BY user_type;

SELECT 'Total Active Menus:' as info;
SELECT COUNT(*) as total FROM menus WHERE is_active = true;

SELECT 'Super Admin Users (will see ALL menus):' as info;
SELECT email, user_type 
FROM users 
WHERE LOWER(REPLACE(user_type, ' ', '_')) = 'super_admin';

SELECT 'Admin Users (will see permitted menus):' as info;
SELECT 
    u.email, 
    u.user_type,
    COUNT(up.id) as permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE LOWER(REPLACE(u.user_type, ' ', '_')) = 'admin'
GROUP BY u.email, u.user_type;

SELECT '========================================' as info;
SELECT '✅ Backend code now handles any user_type format:' as info;
SELECT '   - "Super Admin" (with space)' as info;
SELECT '   - "super_admin" (with underscore)' as info;
SELECT '   - "SUPER_ADMIN" (all caps)' as info;
SELECT '   - Any combination!' as info;
SELECT '========================================' as info;
SELECT '🚀 NOW: Restart API server and refresh browser' as next_step;
SELECT '========================================' as info;
