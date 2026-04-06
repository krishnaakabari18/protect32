-- Check if menu system tables exist and show data

-- 1. Check if menus table exists
SELECT 'Checking menus table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'menus'
) as menus_table_exists;

-- 2. Check if user_permissions table exists
SELECT 'Checking user_permissions table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'user_permissions'
) as user_permissions_table_exists;

-- 3. Count and list all menus
SELECT 'Listing all menus...' as step;
SELECT COUNT(*) as total_menus FROM menus;

SELECT 
    name, 
    label, 
    path, 
    icon,
    sort_order, 
    is_active 
FROM menus 
ORDER BY sort_order;

-- 4. Check if specialties menu exists
SELECT 'Checking for Specialties menu...' as step;
SELECT * FROM menus WHERE name = 'specialties';

-- 5. Count permissions
SELECT 'Counting permissions...' as step;
SELECT COUNT(*) as total_permissions FROM user_permissions;

-- 6. Check admin users
SELECT 'Listing admin users...' as step;
SELECT id, email, user_type FROM users WHERE user_type = 'admin';

-- 7. Check if admins have specialties permission
SELECT 'Checking admin permissions for Specialties...' as step;
SELECT 
    u.email,
    m.label as menu_label,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'specialties' AND u.user_type = 'admin';
