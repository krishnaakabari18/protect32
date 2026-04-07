# Dynamic Sidebar Setup - Complete Guide

## What Was Done

### 1. Fixed `/my-menus` API Endpoint
- **File**: `api/src/routes/v1/menuRoutes.js`
- **Changes**:
  - Removed hardcoded menu permissions logic
  - Now uses `user_permissions` table from database
  - Super admins automatically see ALL active menus with full permissions
  - Other users see menus based on their `user_permissions` records
  - Returns permissions: `can_view`, `can_create`, `can_edit`, `can_delete`

### 2. Updated Sidebar Component
- **File**: `components/layouts/sidebar-dentist.tsx`
- **Changes**:
  - Added `ICON_MAP` for dynamic icon rendering
  - Removed hardcoded menu items
  - Fetches menus from `API_ENDPOINTS.myMenus`
  - Dynamically renders all menus from database
  - Shows loading state while fetching
  - Dashboard always visible (hardcoded)

### 3. Fixed Procedures Menu Icon
- **File**: `api/database/add-procedures-menu.sql`
- **Changes**:
  - Changed icon from `IconClipboardList` (doesn't exist) to `IconClipboardText`

### 4. Registered Specialty Routes
- **File**: `api/src/routes/v1/index.js`
- **Changes**:
  - Added `specialtyRoutes` import and mount
  - Now `/api/v1/specialties` endpoint is available

## Setup Instructions

### Step 1: Run SQL Scripts in pgAdmin

Execute these SQL scripts in order:

```sql
-- 1. Add Specialties menu (if not already added)
\i api/database/quick-add-specialties-menu.sql

-- 2. Add Procedures menu
\i api/database/add-procedures-menu.sql
```

Or copy-paste the SQL content directly into pgAdmin query tool.

### Step 2: Restart API Server

```bash
cd api
npm start
```

Wait for: `Server running on port 5000`

### Step 3: Hard Refresh Browser

Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to clear cache and reload.

## Verification Steps

### 1. Check Database
```sql
-- Verify menus exist
SELECT id, name, label, path, icon, sort_order, is_active 
FROM menus 
WHERE name IN ('specialties', 'procedures')
ORDER BY sort_order;

-- Verify admin permissions
SELECT 
    u.email,
    m.label as menu_name,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name IN ('specialties', 'procedures')
    AND u.user_type = 'admin';
```

### 2. Check API Response
Open browser console and run:
```javascript
fetch('https://your-api-url/api/v1/menus/my-menus', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => console.log('My Menus:', d));
```

Should return:
```json
{
    "success": true,
    "data": [
        {
            "id": "...",
            "name": "specialties",
            "label": "Specialties",
            "path": "/management/specialties",
            "icon": "IconStar",
            "can_view": true,
            "can_create": true,
            "can_edit": true,
            "can_delete": true
        },
        {
            "id": "...",
            "name": "procedures",
            "label": "Procedures",
            "path": "/management/procedures",
            "icon": "IconClipboardText",
            "can_view": true,
            "can_create": true,
            "can_edit": true,
            "can_delete": true
        }
        // ... other menus
    ],
    "user_type": "super_admin",
    "total": 20
}
```

### 3. Check Sidebar
- Login as super admin
- Look at left sidebar under "Management" section
- You should see:
  - Users
  - Patients
  - Providers
  - Specialties ⭐ (NEW)
  - Procedures 📋 (NEW)
  - Appointments
  - Treatment Plans
  - ... (all other menus)

### 4. Test Dynamic Behavior

#### Test 1: Add New Menu via SQL
```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('test-menu', 'Test Menu', '/management/test', 'IconFile', 99, true);
```

Refresh browser → "Test Menu" should appear in sidebar automatically!

#### Test 2: Disable Menu
```sql
UPDATE menus SET is_active = false WHERE name = 'test-menu';
```

Refresh browser → "Test Menu" should disappear!

#### Test 3: User Permissions
```sql
-- Remove view permission for a specific user
UPDATE user_permissions 
SET can_view = false 
WHERE user_id = 'some-user-id' AND menu_id = (SELECT id FROM menus WHERE name = 'procedures');
```

Login as that user → Procedures menu should not appear!

## How It Works

### Super Admin
- Sees ALL active menus automatically
- No need to set permissions in `user_permissions` table
- Full permissions (view, create, edit, delete) on everything

### Other Users (admin, support, account)
- Only see menus where `user_permissions.can_view = true`
- Permissions controlled by `user_permissions` table
- When new menu is added, trigger automatically grants admin users full permissions

### Adding New Menus

1. **Via SQL**:
```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('my-new-menu', 'My New Menu', '/management/my-new-menu', 'IconFile', 50, true);
```

2. **Via API** (if you build a menu management UI):
```javascript
fetch('https://your-api-url/api/v1/menus', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'my-new-menu',
        label: 'My New Menu',
        path: '/management/my-new-menu',
        icon: 'IconFile',
        sort_order: 50,
        is_active: true
    })
});
```

3. **Automatic Permission Grant**:
   - Database trigger `trigger_grant_admin_permissions` automatically runs
   - Grants full permissions to all admin users
   - Super admins don't need permissions (they see everything)

## Available Icons

Icons available in `ICON_MAP`:
- `IconMenuUsers` - Users icon
- `IconUser` - Single user icon
- `IconCalendar` - Calendar icon
- `IconTag` - Tag/label icon
- `IconClipboardText` - Clipboard with text
- `IconCreditCard` - Credit card icon
- `IconFile` - File icon
- `IconStar` - Star icon
- `IconBell` - Bell/notification icon
- `IconNotes` - Notes icon
- `IconHelp` - Help/question icon
- `IconSettings` - Settings/gear icon

To add more icons, update `ICON_MAP` in `components/layouts/sidebar-dentist.tsx`.

## Troubleshooting

### Menus Not Showing
1. Check API response in browser console
2. Verify menus exist in database: `SELECT * FROM menus WHERE is_active = true;`
3. Check user permissions: `SELECT * FROM user_permissions WHERE user_id = 'your-user-id';`
4. Ensure API server is running
5. Hard refresh browser (Ctrl+Shift+R)

### Icons Not Displaying
1. Check icon name in database matches `ICON_MAP`
2. Add missing icon to `ICON_MAP` in sidebar component
3. Import icon component at top of file

### Permissions Not Working
1. Verify `user_permissions` table has records
2. Check trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_grant_admin_permissions';`
3. Manually grant permissions if needed:
```sql
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
VALUES ('user-id', 'menu-id', true, true, true, true);
```

## Summary

✅ Sidebar is now 100% dynamic
✅ Menus fetched from database
✅ Super admins see all menus automatically
✅ Other users see menus based on permissions
✅ New menus automatically appear in sidebar
✅ Specialties and Procedures ready to add
✅ User permissions integrated with menu system

The system is ready! Just run the SQL scripts and restart the API server.
