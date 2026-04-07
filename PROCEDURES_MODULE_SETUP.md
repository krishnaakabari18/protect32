# Procedures Module - Complete Setup Guide

## What Was Created

### Backend
1. ✅ Fixed `api/src/models/procedureModel.js` - SQL syntax errors corrected
2. ✅ Procedures API already exists (controller, routes)
3. ✅ Database table already exists with default procedures

### Frontend
1. ✅ Created `app/(defaults)/management/procedures/page.tsx` - Full CRUD interface
2. ✅ Added Procedures menu to sidebar
3. ✅ Added to menu system database

### Database
1. ✅ Created SQL script to add Procedures to menu system

## Setup Steps

### Step 1: Add Procedures Menu to Database

Open pgAdmin → Query Tool → Run:

```sql
\i 'C:/wamp/www/protect32/api/database/add-procedures-menu.sql'
```

Or copy-paste this SQL:

```sql
-- Add Procedures menu
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('procedures', 'Procedures', '/management/procedures', 'IconClipboardList', 3.5, true)
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
WHERE u.user_type = 'admin' AND m.name = 'procedures'
ON CONFLICT (user_id, menu_id) 
DO UPDATE SET 
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;
```

### Step 2: Verify Procedures Table Exists

Run in pgAdmin:

```sql
SELECT * FROM procedures LIMIT 5;
```

**If table doesn't exist**, run:

```sql
\i 'C:/wamp/www/protect32/api/database/create-procedures-table.sql'
```

### Step 3: Restart API Server

```bash
cd api
npm start
```

Or press `Ctrl+C` and then `npm start`

### Step 4: Refresh Frontend

Press `Ctrl + Shift + R` (hard refresh) in browser

### Step 5: Test

1. **Check Sidebar** - You should see "Procedures" menu item
2. **Click Procedures** - Opens `/management/procedures`
3. **View List** - Shows all procedures with categories
4. **Add Procedure** - Click "+ Add Procedure"
5. **Edit Procedure** - Click edit icon
6. **Delete Procedure** - Click delete icon

## Features

### List View
- Displays all procedures with name, category, description, status
- Search by name or description
- Filter by category
- Pagination support
- Active/Inactive status badges

### Add Procedure
- **Name** (required) - e.g., "Root Canal Treatment"
- **Category** (required) - Dropdown with 10 categories
- **Description** (optional) - Textarea for details
- **Status** - Active/Inactive

### Edit Procedure
- Update any field
- Validates unique name constraint

### Delete Procedure
- Removes procedure from database
- Shows confirmation dialog

## Categories Available

1. Diagnostic & Preventive
2. Restorative
3. Endodontics
4. Periodontics
5. Prosthodontics
6. Orthodontics
7. Oral Surgery
8. Cosmetic
9. Pediatric
10. Other

## Default Procedures Included

The database already has 16 default procedures:
1. Initial Check-up (Diagnostic)
2. Teeth Cleaning & Polishing (Preventive)
3. Dental X-Ray (IOPA) (Diagnostic)
4. Tooth Filling (Composite) (Restorative)
5. Root Canal Treatment (RCT) (Endodontics)
6. Dental Crown (Zirconia/Porcelain) (Restorative)
7. Wisdom Tooth Extraction (Oral Surgery)
8. Metal Braces (Orthodontics)
9. Teeth Whitening (In-Office) (Cosmetic)
10. Dental Implant (Oral Surgery)
11. Teeth Scaling (Preventive)
12. Gum Treatment (Periodontics)
13. Dentures (Complete) (Prosthodontics)
14. Dentures (Partial) (Prosthodontics)
15. Tooth Extraction (Simple) (Oral Surgery)
16. Tooth Extraction (Surgical) (Oral Surgery)

## API Endpoints

All endpoints already exist:

- `GET /api/v1/procedures` - List all (with pagination, search, filter)
- `GET /api/v1/procedures/:id` - Get one
- `POST /api/v1/procedures` - Create new
- `PUT /api/v1/procedures/:id` - Update
- `DELETE /api/v1/procedures/:id` - Delete
- `GET /api/v1/procedures/categories` - Get all categories
- `GET /api/v1/procedures/by-category` - Get procedures grouped by category

## Integration with Provider Form

The Procedures dropdown in the Provider form already uses this API:

```typescript
// In providers-crud.tsx
const fetchProcedures = async () => {
    const res = await fetch(`${API_ENDPOINTS.procedures}?limit=1000&is_active=true`);
    const data = await res.json();
    if (res.ok) setProcedures(data.data || []);
};
```

When you add a new procedure via the Procedures page, it will automatically appear in the Provider form's procedure dropdown!

## User Permissions

### Admin Users
- Automatically get full access (View, Create, Edit, Delete)

### Other Users
- Go to Users → Edit User → Menu Permissions
- Check "Procedures" to grant access
- User will see Procedures menu in sidebar

## Testing

### Test 1: View Procedures
```
GET http://localhost:3000/management/procedures
```

### Test 2: Add New Procedure
1. Click "+ Add Procedure"
2. Fill in:
   - Name: "Teeth Bonding"
   - Category: "Cosmetic"
   - Description: "Cosmetic procedure to improve appearance"
   - Status: Active
3. Click "Add Procedure"

### Test 3: Verify in Provider Form
1. Go to Providers → Add Provider
2. Go to Provider Info tab
3. Click "Procedures" dropdown
4. Your new procedure should appear in the list!

### Test 4: Filter by Category
1. In Procedures page
2. Use category dropdown filter
3. Select "Cosmetic"
4. Only cosmetic procedures show

### Test 5: Search
1. Type "root" in search box
2. Shows "Root Canal Treatment"

## Troubleshooting

### "Procedures menu not showing in sidebar"
- Run SQL script to add menu
- Restart API server
- Hard refresh browser (Ctrl+Shift+R)
- Check user has permission

### "Can't add procedure - name already exists"
- Procedure names must be unique
- Try a different name

### "Procedures not showing in Provider form"
- Check procedures are marked as Active
- Refresh the Provider form page
- Check API endpoint: `/api/v1/procedures?is_active=true`

### "Category dropdown empty"
- Categories are hardcoded in frontend
- Check `PROCEDURE_CATEGORIES` array in page.tsx

## Next Steps

### Add More Categories
Edit `app/(defaults)/management/procedures/page.tsx`:

```typescript
const PROCEDURE_CATEGORIES = [
    'Diagnostic & Preventive',
    'Restorative',
    // ... add more here
    'Your New Category'
];
```

### Add Pricing
You can extend the procedures table to include pricing:

```sql
ALTER TABLE procedures ADD COLUMN base_price DECIMAL(10,2);
ALTER TABLE procedures ADD COLUMN currency VARCHAR(3) DEFAULT 'INR';
```

Then update the form to include price fields.

## Summary

✅ Procedures management page created
✅ Full CRUD operations (Add, Edit, Delete, View)
✅ Category filtering
✅ Search functionality
✅ Active/Inactive status
✅ Menu added to sidebar
✅ Integrated with Provider form
✅ User permissions support
✅ 16 default procedures included

Access at: `http://localhost:3000/management/procedures`
