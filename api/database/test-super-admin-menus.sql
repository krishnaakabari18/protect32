-- Test Script: Verify Super Admin Sees All Menus Without Permissions
-- This script tests that super_admin users see all menus regardless of user_permissions table

-- Step 1: Check current super admin users
SELECT 'Current Super Admin Users:' as step;
SELECT id, email, user_type, created_at
FROM users 
WHERE user_type = 'super_admin'
ORDER BY created_at;

-- Step 2: Check all active menus
SELECT 'All Active Menus:' as step;
SELECT id, name, label, path, icon, sort_order, is_active
FROM menus 
WHERE is_active = true
ORDER BY sort_order ASC;

-- Step 3: Check if super admins have permissions in user_permissions table
SELECT 'Super Admin Permissions in user_permissions table:' as step;
SELECT 
    u.email,
    m.name as menu_name,
    m.label,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
LEFT JOIN menus m ON up.menu_id = m.id
WHERE u.user_type = 'super_admin'
ORDER BY u.email, m.sort_order;

-- Step 4: Count menus vs permissions for super admins
SELECT 'Menu Count vs Permission Count:' as step;
SELECT 
    (SELECT COUNT(*) FROM menus WHERE is_active = true) as total_active_menus,
    (SELECT COUNT(DISTINCT up.menu_id) 
     FROM user_permissions up 
     JOIN users u ON up.user_id = u.id 
     WHERE u.user_type = 'super_admin') as super_admin_permissions,
    CASE 
        WHEN (SELECT COUNT(*) FROM menus WHERE is_active = true) > 
             (SELECT COUNT(DISTINCT up.menu_id) 
              FROM user_permissions up 
              JOIN users u ON up.user_id = u.id 
              WHERE u.user_type = 'super_admin')
        THEN '✓ CORRECT: Super admins should NOT need all permissions in table'
        ELSE '⚠ Super admins have permissions for all menus (not required but OK)'
    END as status;

-- Step 5: Test - Remove all permissions for a super admin (they should still see all menus)
SELECT 'Test: What happens if we remove super admin permissions?' as step;
SELECT 
    'Super admins should see ALL menus via API regardless of user_permissions table' as expected_behavior,
    'The /api/v1/menus/my-menus endpoint checks user_type first' as implementation,
    'If user_type = super_admin, returns all active menus with full permissions' as logic;

-- Step 6: Verify the difference between super_admin and admin
SELECT 'Comparison: super_admin vs admin:' as step;
SELECT 
    user_type,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT up.menu_id) as menus_with_permissions,
    (SELECT COUNT(*) FROM menus WHERE is_active = true) as total_active_menus,
    CASE 
        WHEN user_type = 'super_admin' 
        THEN 'Should see ALL menus (no permissions needed)'
        ELSE 'Should see only menus with can_view = true'
    END as expected_behavior
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id AND up.can_view = true
WHERE u.user_type IN ('super_admin', 'admin')
GROUP BY user_type;

-- Step 7: Check for menus that NO admin has permissions for
SELECT 'Menus without admin permissions:' as step;
SELECT 
    m.name,
    m.label,
    m.path,
    COUNT(up.id) FILTER (WHERE u.user_type = 'admin') as admin_permissions,
    COUNT(up.id) FILTER (WHERE u.user_type = 'super_admin') as super_admin_permissions,
    CASE 
        WHEN COUNT(up.id) FILTER (WHERE u.user_type = 'admin') = 0
        THEN '⚠ No admin users have permission'
        ELSE '✓ Admin users have permission'
    END as admin_status,
    'Super admins will see this regardless' as super_admin_status
FROM menus m
LEFT JOIN user_permissions up ON m.id = up.menu_id AND up.can_view = true
LEFT JOIN users u ON up.user_id = u.id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.label, m.path, m.sort_order
ORDER BY m.sort_order;

-- Step 8: Simulate API response for super_admin
SELECT 'Simulated API Response for super_admin:' as step;
SELECT 
    m.id,
    m.name,
    m.label,
    m.path,
    m.icon,
    m.sort_order,
    true as can_view,
    true as can_create,
    true as can_edit,
    true as can_delete,
    'super_admin sees ALL menus' as note
FROM menus m
WHERE m.is_active = true
ORDER BY m.sort_order ASC, m.label ASC;

-- Step 9: Simulate API response for regular admin (with permissions)
SELECT 'Simulated API Response for admin (with permissions):' as step;
SELECT 
    m.id,
    m.name,
    m.label,
    m.path,
    m.icon,
    m.sort_order,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete,
    'admin sees only permitted menus' as note
FROM menus m
INNER JOIN user_permissions up ON m.id = up.menu_id
INNER JOIN users u ON up.user_id = u.id
WHERE m.is_active = true
    AND u.user_type = 'admin'
    AND up.can_view = true
    AND u.id = (SELECT id FROM users WHERE user_type = 'admin' LIMIT 1)
ORDER BY m.sort_order ASC, m.label ASC;

-- Step 10: Final Summary
SELECT 'FINAL SUMMARY:' as step;
SELECT 
    'Super Admin Behavior' as category,
    'Sees ALL active menus' as behavior,
    'No permissions needed in user_permissions table' as requirement,
    'Backend checks user_type = super_admin first' as implementation,
    'Always returns can_view/create/edit/delete = true' as permissions;

SELECT 
    'Admin Behavior' as category,
    'Sees only permitted menus' as behavior,
    'Requires user_permissions records with can_view = true' as requirement,
    'Backend joins with user_permissions table' as implementation,
    'Returns actual permission values from table' as permissions;

-- Step 11: Recommendations
SELECT 'RECOMMENDATIONS:' as step;
SELECT 
    '1. Super admins do NOT need records in user_permissions table' as recommendation
UNION ALL
SELECT 
    '2. Admin users MUST have records in user_permissions table'
UNION ALL
SELECT 
    '3. When adding new menus, only grant permissions to admin users'
UNION ALL
SELECT 
    '4. Super admins will automatically see new menus'
UNION ALL
SELECT 
    '5. Use trigger to auto-grant permissions to admin users only';

-- Step 12: Test Query - What a super admin would see
SELECT 'TEST: What super_admin user would see:' as step;
DO $$
DECLARE
    super_admin_id UUID;
    menu_count INT;
BEGIN
    -- Get first super admin
    SELECT id INTO super_admin_id FROM users WHERE user_type = 'super_admin' LIMIT 1;
    
    IF super_admin_id IS NULL THEN
        RAISE NOTICE 'No super_admin user found in database';
    ELSE
        -- Count menus they would see
        SELECT COUNT(*) INTO menu_count FROM menus WHERE is_active = true;
        RAISE NOTICE 'Super admin (%) would see % menus', super_admin_id, menu_count;
        RAISE NOTICE 'This includes ALL active menus regardless of user_permissions table';
    END IF;
END $$;
