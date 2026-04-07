# Dynamic Menu Permissions - Complete Fix

## Problem
- Specialties and Procedures menus were in the database
- But they were NOT showing in the User edit form's "Menu Permissions" section
- The menu list was hardcoded in the frontend

## Solution
Made the menu permissions list dynamic by fetching from the API.

## Changes Made

### File: `components/management/users-crud.tsx`

**1. Added menus state:**
```typescript
const [menus, setMenus] = useState<any[]>([]);
```

**2. Added fetchMenus function:**
```typescript
const fetchMenus = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_ENDPOINTS.menus}?is_active=true`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
    });
    const data = await response.json();
    if (response.ok) {
        setMenus(data.data || []);
    }
};
```

**3. Replaced hardcoded menu list with dynamic:**
```typescript
// OLD: Hardcoded array
[
    { key: 'patients', label: 'Patients' },
    { key: 'providers', label: 'Providers' },
    // ... 16 hardcoded items
]

// NEW: Dynamic from API
{menus.map(menu => (
    <label key={menu.name}>
        <input type="checkbox" checked={...} />
        <span>{menu.label}</span>
    </label>
))}
```

## How It Works Now

### When User Edit Form Opens:
1. Fetches all active menus from `/api/v1/menus?is_active=true`
2. Displays ALL menus in the database (including Specialties and Procedures)
3. Shows checkboxes for each menu
4. User can check/uncheck to grant/revoke access

### When New Menu is Added:
1. Admin adds new menu via SQL or API
2. Menu is stored in `menus` table
3. Trigger automatically grants permission to admin users
4. **Next time user edit form opens, new menu appears automatically!**

No code changes needed when adding new menus!

## Testing Steps

### Step 1: Ensure Menus Exist in Database

Run in pgAdmin:

```sql
SELECT name, label, path, sort_order, is_active 
FROM menus 
WHERE name IN ('specialties', 'procedures')
ORDER BY sort_order;
```

**Expected Result:** Both menus should be there.

**If not**, run:

```sql
-- Add Specialties
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true)
ON CONFLICT (name) DO NOTHING;

-- Add Procedures
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('procedures', 'Procedures', '/management/procedures', 'IconClipboardList', 3.5, true)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions to admins
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name IN ('specialties', 'procedures')
ON CONFLICT (user_id, menu_id) DO NOTHING;
```

### Step 2: Restart API Server

```bash
cd api
npm start
```

### Step 3: Hard Refresh Frontend

Press `Ctrl + Shift + R` in browser

### Step 4: Test User Edit Form

1. Go to Users page (`/management/users`)
2. Click Edit icon on any user
3. Scroll down to "Menu Permissions" section
4. **You should now see:**
   - Patients ✓
   - Providers ✓
   - **Specialties** ← NEW!
   - **Procedures** ← NEW!
   - Appointments ✓
   - Treatment Plans ✓
   - ... all other menus

### Step 5: Test Adding New Menu

**Add a new menu via SQL:**

```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('reports', 'Reports', '/management/reports', 'IconChart', 20, true);

-- Grant to admins
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN menus m
WHERE u.user_type = 'admin' AND m.name = 'reports'
ON CONFLICT (user_id, menu_id) DO NOTHING;
```

**Refresh user edit form:**
- Close and reopen the edit modal
- "Reports" should now appear in the menu permissions list!

## Benefits

### Before (Hardcoded):
- ❌ Had to edit code to add new menu
- ❌ Required deployment
- ❌ Menus in database but not in UI
- ❌ Inconsistent data

### After (Dynamic):
- ✅ Add menu via SQL or API
- ✅ Appears automatically in UI
- ✅ No code changes needed
- ✅ No deployment needed
- ✅ Always in sync with database

## API Endpoint Used

```
GET /api/v1/menus?is_active=true

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "specialties",
      "label": "Specialties",
      "path": "/management/specialties",
      "icon": "IconStar",
      "sort_order": 4,
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "procedures",
      "label": "Procedures",
      "path": "/management/procedures",
      "icon": "IconClipboardList",
      "sort_order": 3.5,
      "is_active": true
    },
    // ... all other menus
  ]
}
```

## Current Menu List

After setup, you should see these menus in user permissions:

1. Users
2. Patients
3. Providers
4. **Procedures** ← NEW
5. **Specialties** ← NEW
6. Appointments
7. Treatment Plans
8. Prescriptions
9. Plans
10. Treatment Fees
11. Orders (Payments)
12. Documents
13. Reviews
14. Notifications
15. Support Tickets
16. Settings
17. CMS Pages
18. FAQs
19. Patient Education

## Troubleshooting

### "Menus not showing in permissions list"
- Check API response: Open DevTools → Network → Look for `/menus` call
- Verify API returns data
- Check browser console for errors

### "Specialties/Procedures still not showing"
- Verify menus exist in database (run SQL query above)
- Verify `is_active = true`
- Restart API server
- Hard refresh browser (Ctrl+Shift+R)

### "New menu not appearing"
- Check menu was added to database
- Check `is_active = true`
- Close and reopen user edit modal (it fetches on open)
- Check API endpoint returns the new menu

### "Can't save user permissions"
- Check user has permission to edit users
- Check API endpoint for saving permissions
- Check browser console for errors

## Next Steps

### Add Menu Management Page

Create a page to manage menus via UI instead of SQL:
- `/management/menus`
- Add, Edit, Delete menus
- Reorder menus
- Enable/Disable menus

### Add Permission Details

Extend to show not just View permission, but also:
- Can Create
- Can Edit
- Can Delete

Currently only "View" is managed via checkboxes.

## Summary

✅ Menu permissions are now dynamic
✅ Fetched from database via API
✅ Specialties and Procedures now show
✅ New menus automatically appear
✅ No code changes needed for new menus
✅ Fully synchronized with database

The system is now truly dynamic!
