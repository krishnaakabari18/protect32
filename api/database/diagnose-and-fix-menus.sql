-- DIAGNOSTIC AND FIX SCRIPT FOR MENU SYSTEM
-- Run this script to diagnose and fix menu issues

-- ============================================
-- STEP 1: DIAGNOSE THE PROBLEM
-- ============================================

-- Check 1: What user_type values exist?
SELECT 'Step 1: Checking user_type values' as step;
SELECT DISTINCT user_type, COUNT(*) as count
FROM users
GROUP BY user_type
ORDER BY user_type;

-- Check 2: Check specific users
SELECT 'Step 2: Checking specific users' as step;
SELECT id, email, user_type
FROM users
WHERE email IN ('superadmin@dentist.com', 'admin@dentist.com', 'account@dentist.com', 'support@dentist.com')
ORDER BY user_type;

-- Check 3: Do menus exist?
SELECT 'Step 3: Checking if menus table exists and has data' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menus')
        THEN 'YES - menus table exists'
        ELSE 'NO - menus table does not exist'
    END as table_exists,
    (SELECT COUNT(*) FROM menus) as total_menus,
    (SELECT COUNT(*) FROM menus WHERE is_active = true) as active_menus;

-- Check 4: List all menus
SELECT 'Step 4: All menus in database' as step;
SELECT id, name, label, path, icon, sort_order, is_active
FROM menus
ORDER BY sort_order;

-- Check 5: Do user_permissions exist?
SELECT 'Step 5: Checking user_permissions table' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions')
        THEN 'YES - user_permissions table exists'
        ELSE 'NO - user_permissions table does not exist'
    END as table_exists,
    (SELECT COUNT(*) FROM user_permissions) as total_permissions;

-- Check 6: Permissions for admin users
SELECT 'Step 6: Permissions for admin users' as step;
SELECT 
    u.email,
    u.user_type,
    COUNT(up.id) as permission_count,
    COUNT(up.id) FILTER (WHERE up.can_view = true) as viewable_menus
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.user_type IN ('admin', 'Admin', 'ADMIN')
GROUP BY u.id, u.email, u.user_type;

-- ============================================
-- STEP 2: FIX THE PROBLEMS
-- ============================================

-- Fix 1: Standardize user_type values to lowercase
SELECT 'Fix 1: Standardizing user_type values' as step;
UPDATE users SET user_type = 'super_admin' WHERE LOWER(user_type) IN ('super_admin', 'super admin', 'superadmin');
UPDATE users SET user_type = 'admin' WHERE LOWER(user_type) = 'admin' AND user_type != 'super_admin';
UPDATE users SET user_type = 'support' WHERE LOWER(user_type) = 'support';
UPDATE users SET user_type = 'account' WHERE LOWER(user_type) = 'account';

-- Verify fix
SELECT 'After standardization:' as info;
SELECT DISTINCT user_type, COUNT(*) as count
FROM users
GROUP BY user_type;

-- Fix 2: Ensure menus table exists and has data
SELECT 'Fix 2: Checking menus table' as step;

-- If menus table is empty or missing menus, insert default menus
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

SELECT 'Menus inserted/updated' as info;
SELECT COUNT(*) as total_menus FROM menus;

-- Fix 3: Grant permissions to ALL admin users (not super_admin)
SELECT 'Fix 3: Granting permissions to admin users' as step;

-- Delete existing permissions for admin users to start fresh
DELETE FROM user_permissions 
WHERE user_id IN (SELECT id FROM users WHERE user_type = 'admin');

-- Grant full permissions to all admin users for all menus
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.is_active = true
ON CONFLICT (user_id, menu_id) DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;

SELECT 'Permissions granted to admin users' as info;

-- Fix 4: Grant limited permissions to support users
SELECT 'Fix 4: Granting permissions to support users' as step;

-- Delete existing permissions for support users
DELETE FROM user_permissions 
WHERE user_id IN (SELECT id FROM users WHERE user_type = 'support');

-- Grant limited permissions to support users
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, false, false, false
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'support' 
    AND m.name IN ('patients', 'appointments', 'support-tickets', 'notifications', 'documents', 'reviews')
ON CONFLICT (user_id, menu_id) DO UPDATE SET
    can_view = true;

SELECT 'Permissions granted to support users' as info;

-- Fix 5: Grant limited permissions to account users
SELECT 'Fix 5: Granting permissions to account users' as step;

-- Delete existing permissions for account users
DELETE FROM user_permissions 
WHERE user_id IN (SELECT id FROM users WHERE user_type = 'account');

-- Grant limited permissions to account users
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, false, true, false
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'account' 
    AND m.name IN ('patients', 'providers', 'payments', 'plans', 'provider-fees', 'documents')
ON CONFLICT (user_id, menu_id) DO UPDATE SET
    can_view = true,
    can_edit = true;

SELECT 'Permissions granted to account users' as info;

-- ============================================
-- STEP 3: VERIFY THE FIX
-- ============================================

-- Verify 1: Check user types are standardized
SELECT 'Verification 1: User types' as step;
SELECT user_type, COUNT(*) as count
FROM users
GROUP BY user_type
ORDER BY user_type;

-- Verify 2: Check menus exist
SELECT 'Verification 2: Active menus' as step;
SELECT COUNT(*) as active_menus FROM menus WHERE is_active = true;

-- Verify 3: Check admin permissions
SELECT 'Verification 3: Admin user permissions' as step;
SELECT 
    u.email,
    u.user_type,
    COUNT(up.id) as total_permissions,
    COUNT(up.id) FILTER (WHERE up.can_view = true) as viewable_menus
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.user_type = 'admin'
GROUP BY u.id, u.email, u.user_type;

-- Verify 4: Check super_admin has NO permissions (they don't need them)
SELECT 'Verification 4: Super admin permissions (should be 0 or empty)' as step;
SELECT 
    u.email,
    u.user_type,
    COUNT(up.id) as permission_count
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.user_type = 'super_admin'
GROUP BY u.id, u.email, u.user_type;

-- Verify 5: Simulate API response for super_admin
SELECT 'Verification 5: What super_admin would see (ALL menus)' as step;
SELECT 
    m.id,
    m.name,
    m.label,
    m.path,
    true as can_view,
    true as can_create,
    true as can_edit,
    true as can_delete
FROM menus m
WHERE m.is_active = true
ORDER BY m.sort_order ASC
LIMIT 5;

SELECT '... and ' || (SELECT COUNT(*) - 5 FROM menus WHERE is_active = true) || ' more menus' as info;

-- Verify 6: Simulate API response for admin
SELECT 'Verification 6: What admin would see (permitted menus)' as step;
SELECT 
    m.name,
    m.label,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM menus m
INNER JOIN user_permissions up ON m.id = up.menu_id
INNER JOIN users u ON up.user_id = u.id
WHERE m.is_active = true
    AND u.user_type = 'admin'
    AND up.can_view = true
    AND u.id = (SELECT id FROM users WHERE user_type = 'admin' LIMIT 1)
ORDER BY m.sort_order ASC
LIMIT 5;

SELECT '... and ' || (
    SELECT COUNT(*) - 5 
    FROM menus m
    INNER JOIN user_permissions up ON m.id = up.menu_id
    INNER JOIN users u ON up.user_id = u.id
    WHERE m.is_active = true
        AND u.user_type = 'admin'
        AND up.can_view = true
        AND u.id = (SELECT id FROM users WHERE user_type = 'admin' LIMIT 1)
) || ' more menus' as info;

-- ============================================
-- FINAL SUMMARY
-- ============================================

SELECT 'FINAL SUMMARY' as step;
SELECT 
    'Super Admin Users' as user_type,
    (SELECT COUNT(*) FROM users WHERE user_type = 'super_admin') as count,
    'See ALL menus (no permissions needed)' as behavior,
    (SELECT COUNT(*) FROM menus WHERE is_active = true) as menus_visible;

SELECT 
    'Admin Users' as user_type,
    (SELECT COUNT(*) FROM users WHERE user_type = 'admin') as count,
    'See permitted menus only' as behavior,
    (SELECT COUNT(DISTINCT up.menu_id) 
     FROM user_permissions up 
     JOIN users u ON up.user_id = u.id 
     WHERE u.user_type = 'admin' AND up.can_view = true) as menus_visible;

SELECT 
    'Support Users' as user_type,
    (SELECT COUNT(*) FROM users WHERE user_type = 'support') as count,
    'See limited menus' as behavior,
    (SELECT COUNT(DISTINCT up.menu_id) 
     FROM user_permissions up 
     JOIN users u ON up.user_id = u.id 
     WHERE u.user_type = 'support' AND up.can_view = true) as menus_visible;

SELECT 
    'Account Users' as user_type,
    (SELECT COUNT(*) FROM users WHERE user_type = 'account') as count,
    'See limited menus' as behavior,
    (SELECT COUNT(DISTINCT up.menu_id) 
     FROM user_permissions up 
     JOIN users u ON up.user_id = u.id 
     WHERE u.user_type = 'account' AND up.can_view = true) as menus_visible;

SELECT '✅ SCRIPT COMPLETE - Now restart API server and refresh browser' as final_message;
