# Setup Menu System - Step by Step

## Problem
Specialties menu is not showing in:
1. Menu Permissions list (when editing users)
2. Left sidebar

## Solution

Follow these steps exactly:

### Step 1: Check if Tables Exist

Open pgAdmin → Query Tool → Run:

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'menus'
) as menus_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'user_permissions'
) as permissions_exists;
```

**If both return `false`**, continue to Step 2.
**If both return `true`**, skip to Step 3.

### Step 2: Create Menu System Tables

In pgAdmin Query Tool, run:

```sql
\i 'C:/wamp/www/protect32/api/database/create-menu-system.sql'
```

Or copy and paste the entire content of `api/database/create-menu-system.sql` into Query Tool and execute.

**Expected Result:**
- Tables created
- 18 menus inserted
- Trigger created
- Admin permissions granted

### Step 3: Verify Menus Were Created

Run this in pgAdmin:

```sql
SELECT name, label, path, is_active 
FROM menus 
ORDER BY sort_order;
```

**Expected Result:** You should see 18 menus including:
- users
- patients
- providers
- **specialties** ← This one must be there!
- appointments
- etc.

### Step 4: Check if Specialties Menu Exists

Run:

```sql
SELECT * FROM menus WHERE name = 'specialties';
```

**If NO rows returned:**

Run this to add it manually:

```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true)
ON CONFLICT (name) DO NOTHING;
```

### Step 5: Check Admin Users

Run:

```sql
SELECT id, email, user_type FROM users WHERE user_type = 'admin';
```

**Note the admin user IDs** - you'll need them.

### Step 6: Grant Permissions to Admins

If specialties menu exists but admins don't have permission, run:

```sql
-- Replace 'SPECIALTIES_MENU_ID' with actual ID from Step 4
-- Replace 'ADMIN_USER_ID' with actual admin ID from Step 5

INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name = 'specialties'
ON CONFLICT (user_id, menu_id) 
DO UPDATE SET 
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;
```

### Step 7: Verify Permissions

Run:

```sql
SELECT 
    u.email,
    m.label as menu,
    up.can_view,
    up.can_create,
    up.can_edit,
    up.can_delete
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'specialties';
```

**Expected Result:** You should see your admin user with all permissions = true.

### Step 8: Restart API Server

```bash
cd api
npm start
```

Or press `Ctrl+C` in the terminal where API is running, then `npm start` again.

### Step 9: Test API Endpoint

Open browser or Postman:

```
GET https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/menus/my-menus

Headers:
  Authorization: Bearer YOUR_TOKEN
  ngrok-skip-browser-warning: true
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "specialties",
      "label": "Specialties",
      "path": "/management/specialties",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    },
    // ... other menus
  ]
}
```

### Step 10: Refresh Frontend

1. Open browser
2. Press `Ctrl + Shift + R` (hard refresh)
3. Go to Users page
4. Click Edit on a user
5. Check "Menu Permissions" section

**Expected Result:** You should now see "Specialties" checkbox!

### Step 11: Check Left Sidebar

The sidebar is currently hardcoded. To make it dynamic, you need to update the sidebar component.

**Current:** `components/layouts/sidebar-dentist.tsx` has hardcoded menus

**To Fix:** Update sidebar to fetch from API (see next section)

## Making Sidebar Dynamic

Update `components/layouts/sidebar-dentist.tsx`:

```typescript
const [menus, setMenus] = useState<any[]>([]);

useEffect(() => {
    fetchMenus();
}, []);

const fetchMenus = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(API_ENDPOINTS.myMenus, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await response.json();
        if (data.success) {
            setMenus(data.data);
        }
    } catch (error) {
        console.error('Error fetching menus:', error);
    }
};

// Then render:
{menus.map(menu => (
    menu.can_view && menuItem(menu.path, 
        <IconComponent name={menu.icon} />, 
        menu.label
    )
))}
```

## Quick Fix SQL Script

If you just want to add Specialties quickly, run this:

```sql
-- Add specialties menu if not exists
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions to all admins
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name = 'specialties'
ON CONFLICT (user_id, menu_id) DO NOTHING;

-- Verify
SELECT 
    u.email,
    m.label,
    up.can_view
FROM user_permissions up
JOIN users u ON up.user_id = u.id
JOIN menus m ON up.menu_id = m.id
WHERE m.name = 'specialties';
```

## Troubleshooting

### "Specialties still not showing"
- Clear browser cache
- Check API response from `/menus/my-menus`
- Verify database has the menu
- Verify user has permission

### "API returns empty array"
- Check user is logged in
- Check token is valid
- Check user has at least one menu permission

### "Left sidebar still hardcoded"
- Sidebar needs to be updated to fetch from API
- Currently it uses `can('specialties')` function
- Need to replace with dynamic menu rendering
