-- Add Procedures menu to the menu system

INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('procedures', 'Procedures', '/management/procedures', 'IconClipboardText', 3.5, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Grant full permissions to all admin users
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name = 'procedures'
ON CONFLICT (user_id, menu_id) 
DO UPDATE SET 
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;

-- Verify
SELECT 'Procedures Menu Added:' as info;
SELECT id, name, label, path, icon, sort_order, is_active 
FROM menus 
WHERE name = 'procedures';

SELECT 'Admin Permissions Granted:' as info;
SELECT 
    u.email as admin_email,
    m.label as menu_name,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'procedures' AND u.user_type = 'admin';
