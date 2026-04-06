-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, menu_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_menu_id ON user_permissions(menu_id);

-- Insert default menus (Management section)
INSERT INTO menus (name, label, path, icon, sort_order) VALUES
    ('users', 'Users', '/management/users', 'IconMenuUsers', 1),
    ('patients', 'Patients', '/management/patients', 'IconUser', 2),
    ('providers', 'Providers', '/management/providers', 'IconUser', 3),
    ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4),
    ('appointments', 'Appointments', '/management/appointments', 'IconCalendar', 5),
    ('treatment-plans', 'Treatment Plans', '/management/treatment-plans', 'IconNotes', 6),
    ('prescriptions', 'Prescriptions', '/management/prescriptions', 'IconFile', 7),
    ('plans', 'Plans', '/management/plans', 'IconTag', 8),
    ('provider-fees', 'Treatment Fees', '/management/provider-fees', 'IconClipboardText', 9),
    ('payments', 'Orders', '/management/payments', 'IconCreditCard', 10),
    ('documents', 'Documents', '/management/documents', 'IconFile', 11),
    ('reviews', 'Reviews', '/management/reviews', 'IconStar', 12),
    ('notifications', 'Notifications', '/management/notifications', 'IconBell', 13),
    ('support-tickets', 'Support Tickets', '/management/support-tickets', 'IconHelp', 14),
    ('settings', 'Settings', '/management/settings', 'IconSettings', 15),
    ('cms-pages', 'CMS Pages', '/management/cms-pages', 'IconFile', 16),
    ('faqs', 'FAQs', '/management/faqs', 'IconFile', 17),
    ('patienteducation', 'Patient Education', '/management/patienteducation', 'IconNotes', 18)
ON CONFLICT (name) DO NOTHING;

-- Function to auto-grant permissions to admin users when new menu is added
CREATE OR REPLACE FUNCTION grant_admin_permissions_on_new_menu()
RETURNS TRIGGER AS $$
BEGIN
    -- Grant full permissions to all admin users for new menu
    INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
    SELECT u.id, NEW.id, true, true, true, true
    FROM users u
    WHERE u.user_type = 'admin'
    ON CONFLICT (user_id, menu_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_grant_admin_permissions ON menus;
CREATE TRIGGER trigger_grant_admin_permissions
    AFTER INSERT ON menus
    FOR EACH ROW
    EXECUTE FUNCTION grant_admin_permissions_on_new_menu();

-- Grant permissions to existing admin users for all menus
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin'
ON CONFLICT (user_id, menu_id) DO NOTHING;

COMMENT ON TABLE menus IS 'Dynamic menu system for sidebar navigation';
COMMENT ON TABLE user_permissions IS 'User-specific menu permissions';
