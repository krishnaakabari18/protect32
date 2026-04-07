-- Verification Script for Dynamic Menu System
-- Run this to check if everything is set up correctly

-- 1. Check if menu tables exist
SELECT 'Checking menu tables...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menus') 
        THEN '✓ menus table exists'
        ELSE '✗ menus table MISSING - run create-menu-system.sql'
    END as menus_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions') 
        THEN '✓ user_permissions table exists'
        ELSE '✗ user_permissions table MISSING - run create-menu-system.sql'
    END as permissions_table;

-- 2. Check if trigger exists
SELECT 'Checking auto-permission trigger...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_grant_admin_permissions') 
        THEN '✓ Auto-permission trigger exists'
        ELSE '✗ Trigger MISSING - run create-menu-system.sql'
    END as trigger_status;

-- 3. List all active menus
SELECT 'All active menus:' as step;
SELECT 
    id,
    name,
    label,
    path,
    icon,
    sort_order,
    is_active
FROM menus 
WHERE is_active = true
ORDER BY sort_order ASC;

-- 4. Check if Specialties menu exists
SELECT 'Checking Specialties menu...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM menus WHERE name = 'specialties') 
        THEN '✓ Specialties menu exists'
        ELSE '✗ Specialties menu MISSING - run quick-add-specialties-menu.sql'
    END as specialties_status;

-- 5. Check if Procedures menu exists
SELECT 'Checking Procedures menu...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM menus WHERE name = 'procedures') 
        THEN '✓ Procedures menu exists'
        ELSE '✗ Procedures menu MISSING - run add-procedures-menu.sql'
    END as procedures_status;

-- 6. Count admin users
SELECT 'Admin users count:' as step;
SELECT 
    user_type,
    COUNT(*) as count
FROM users 
WHERE user_type IN ('super_admin', 'admin')
GROUP BY user_type;

-- 7. Check permissions for Specialties
SELECT 'Specialties menu permissions:' as step;
SELECT 
    u.email,
    u.user_type,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'specialties'
ORDER BY u.user_type, u.email;

-- 8. Check permissions for Procedures
SELECT 'Procedures menu permissions:' as step;
SELECT 
    u.email,
    u.user_type,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'procedures'
ORDER BY u.user_type, u.email;

-- 9. Check for menus without permissions
SELECT 'Menus without any permissions:' as step;
SELECT 
    m.name,
    m.label,
    COUNT(up.id) as permission_count
FROM menus m
LEFT JOIN user_permissions up ON m.id = up.menu_id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.label
HAVING COUNT(up.id) = 0
ORDER BY m.sort_order;

-- 10. Summary
SELECT 'SUMMARY:' as step;
SELECT 
    (SELECT COUNT(*) FROM menus WHERE is_active = true) as total_active_menus,
    (SELECT COUNT(*) FROM user_permissions) as total_permissions,
    (SELECT COUNT(*) FROM users WHERE user_type = 'super_admin') as super_admins,
    (SELECT COUNT(*) FROM users WHERE user_type = 'admin') as admins,
    (SELECT COUNT(*) FROM users WHERE user_type = 'support') as support_users,
    (SELECT COUNT(*) FROM users WHERE user_type = 'account') as account_users;

-- 11. Expected vs Actual Menus
SELECT 'Expected menus check:' as step;
SELECT 
    expected_menu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM menus WHERE name = expected_menu AND is_active = true)
        THEN '✓ Found'
        ELSE '✗ Missing'
    END as status
FROM (VALUES 
    ('users'),
    ('patients'),
    ('providers'),
    ('specialties'),
    ('procedures'),
    ('appointments'),
    ('treatment-plans'),
    ('prescriptions'),
    ('plans'),
    ('provider-fees'),
    ('payments'),
    ('documents'),
    ('reviews'),
    ('notifications'),
    ('support-tickets'),
    ('settings'),
    ('cms-pages'),
    ('faqs'),
    ('patienteducation')
) AS expected(expected_menu);

-- 12. Final Status
SELECT 'FINAL STATUS:' as step;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM menus WHERE name IN ('specialties', 'procedures') AND is_active = true) = 2
        THEN '✓✓✓ READY! Both Specialties and Procedures menus are set up.'
        WHEN (SELECT COUNT(*) FROM menus WHERE name IN ('specialties', 'procedures') AND is_active = true) = 1
        THEN '⚠ PARTIAL - One menu is missing. Check above.'
        ELSE '✗✗✗ NOT READY - Both menus are missing. Run the SQL scripts.'
    END as final_status;
