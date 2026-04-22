-- Add Subscriptions menu item
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('subscriptions', 'Subscriptions', '/management/subscriptions', 'IconCreditCard', 11, true)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Verify
SELECT id, name, label, path, icon, sort_order FROM menus WHERE name = 'subscriptions';
