-- Create econsents table
\i api/database/create-econsent-table.sql

-- Add eConsent menu item
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('econsent', 'eConsent', '/management/econsent', 'IconClipboardText', 12, true)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

SELECT id, name, label, path FROM menus WHERE name = 'econsent';
