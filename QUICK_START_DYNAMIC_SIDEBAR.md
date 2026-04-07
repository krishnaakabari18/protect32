# Quick Start: Dynamic Sidebar

## 🚀 3 Steps to Complete Setup

### Step 1: Run SQL Scripts (2 minutes)

Open pgAdmin and run these scripts:

```sql
-- Script 1: Add Specialties menu
\i api/database/quick-add-specialties-menu.sql

-- Script 2: Add Procedures menu  
\i api/database/add-procedures-menu.sql
```

**Or copy-paste directly:**

```sql
-- Add Specialties
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Add Procedures
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('procedures', 'Procedures', '/management/procedures', 'IconClipboardText', 3.5, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Grant permissions to admins
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name IN ('specialties', 'procedures')
ON CONFLICT (user_id, menu_id) 
DO UPDATE SET 
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;
```

### Step 2: Restart API Server (30 seconds)

```bash
cd api
npm start
```

Wait for: `✓ Server running on port 5000`

### Step 3: Hard Refresh Browser (5 seconds)

Press: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

## ✅ Verification

Check your sidebar - you should now see:
- Dashboard
- **Management** section with:
  - Users
  - Patients  
  - Providers
  - **Specialties** ⭐ (NEW)
  - **Procedures** 📋 (NEW)
  - Appointments
  - Treatment Plans
  - Prescriptions
  - Plans
  - Treatment Fees
  - Orders
  - Documents
  - Reviews
  - Notifications
  - Support Tickets
  - Settings
  - CMS Pages
  - FAQs
  - Patient Education

## 🎯 What Changed

### Backend
- ✅ Fixed `/api/v1/menus/my-menus` endpoint to use `user_permissions` table
- ✅ Super admins now see ALL menus automatically
- ✅ Other users see menus based on database permissions
- ✅ Registered specialty routes in API

### Frontend  
- ✅ Sidebar now fetches menus from API dynamically
- ✅ No more hardcoded menu items
- ✅ Icons mapped dynamically
- ✅ Loading state while fetching

### Database
- ✅ Menu system with `menus` and `user_permissions` tables
- ✅ Auto-grant trigger for admin permissions
- ✅ Specialties and Procedures menus ready to add

## 🔥 Test Dynamic Behavior

### Add a new menu instantly:
```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('test-menu', 'Test Menu', '/management/test', 'IconFile', 99, true);
```

Refresh browser → Menu appears! 🎉

### Hide a menu:
```sql
UPDATE menus SET is_active = false WHERE name = 'test-menu';
```

Refresh browser → Menu disappears! 🎉

## 📝 Files Modified

1. `api/src/routes/v1/menuRoutes.js` - Fixed my-menus endpoint
2. `api/src/routes/v1/index.js` - Registered specialty routes
3. `components/layouts/sidebar-dentist.tsx` - Made sidebar dynamic
4. `api/database/add-procedures-menu.sql` - Fixed icon name

## 🆘 Troubleshooting

**Menus not showing?**
- Check browser console for errors
- Verify API is running on port 5000
- Check token: `localStorage.getItem('auth_token')`
- Test API: `curl http://localhost:5000/api/v1/menus/my-menus -H "Authorization: Bearer YOUR_TOKEN"`

**SQL errors?**
- Make sure `menus` and `user_permissions` tables exist
- Run `api/database/create-menu-system.sql` first if needed

**Icons not displaying?**
- Check icon name matches `ICON_MAP` in sidebar
- Available icons: IconMenuUsers, IconUser, IconCalendar, IconTag, IconClipboardText, IconCreditCard, IconFile, IconStar, IconBell, IconNotes, IconHelp, IconSettings

## 🎊 Done!

Your sidebar is now 100% dynamic. Any menu you add to the database will automatically appear in the sidebar!

For detailed documentation, see: `DYNAMIC_SIDEBAR_SETUP_COMPLETE.md`
