# Dynamic Menu System - Complete Implementation

## Overview

This system provides:
1. **Dynamic Menus** - Stored in database, not hardcoded
2. **User Permissions** - Each user has specific menu access
3. **Auto-Permission Grant** - New menus automatically grant permissions to admins
4. **User-Specific Sidebar** - Shows only menus user has access to

## Database Tables Created

### 1. `menus` Table
Stores all menu items with:
- `id` - UUID primary key
- `name` - Unique identifier (e.g., 'specialties')
- `label` - Display name (e.g., 'Specialties')
- `path` - URL path (e.g., '/management/specialties')
- `icon` - Icon name (e.g., 'IconStar')
- `parent_id` - For nested menus (future use)
- `sort_order` - Display order
- `is_active` - Enable/disable menu

### 2. `user_permissions` Table
Stores user-specific permissions:
- `user_id` - References users table
- `menu_id` - References menus table
- `can_view` - Can see the menu
- `can_create` - Can create records
- `can_edit` - Can edit records
- `can_delete` - Can delete records

### 3. Auto-Permission Trigger
When a new menu is added, automatically grants full permissions to all admin users.

## Setup Steps

### Step 1: Create Database Tables

```bash
cd api
psql -U postgres -d protect32 -f database/create-menu-system.sql
```

Or in pgAdmin:
```sql
\i C:/wamp/www/protect32/api/database/create-menu-system.sql
```

### Step 2: Restart API Server

```bash
cd api
npm start
```

### Step 3: Test API Endpoints

The following endpoints are now available:

#### Get My Menus (Current User)
```
GET /api/v1/menus/my-menus
Authorization: Bearer YOUR_TOKEN

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
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    }
  ]
}
```

#### Get All Menus (Admin)
```
GET /api/v1/menus
Authorization: Bearer YOUR_TOKEN
```

#### Create New Menu
```
POST /api/v1/menus
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "reports",
  "label": "Reports",
  "path": "/management/reports",
  "icon": "IconChart",
  "sort_order": 19,
  "is_active": true
}
```

#### Get User Permissions
```
GET /api/v1/menus/users/{userId}/permissions
Authorization: Bearer YOUR_TOKEN
```

#### Update User Permissions
```
PUT /api/v1/menus/users/{userId}/permissions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "permissions": [
    {
      "menu_id": "menu-uuid-1",
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false
    },
    {
      "menu_id": "menu-uuid-2",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    }
  ]
}
```

## Default Menus Included

The following menus are automatically created:

1. Users
2. Patients
3. Providers
4. **Specialties** ← NEW
5. Appointments
6. Treatment Plans
7. Prescriptions
8. Plans
9. Treatment Fees
10. Orders
11. Documents
12. Reviews
13. Notifications
14. Support Tickets
15. Settings
16. CMS Pages
17. FAQs
18. Patient Education

## How It Works

### Adding a New Menu

**Option 1: Via API**
```javascript
POST /api/v1/menus
{
  "name": "inventory",
  "label": "Inventory",
  "path": "/management/inventory",
  "icon": "IconBox",
  "sort_order": 20,
  "is_active": true
}
```

**What Happens:**
1. Menu is created in database
2. Trigger automatically grants full permissions to all admin users
3. Menu appears in admin users' sidebar immediately
4. Other users don't see it until permissions are granted

### Managing User Permissions

**Step 1: Get User's Current Permissions**
```
GET /api/v1/menus/users/{userId}/permissions
```

**Step 2: Update Permissions**
```
PUT /api/v1/menus/users/{userId}/permissions
{
  "permissions": [
    {
      "menu_id": "specialties-menu-id",
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false
    }
  ]
}
```

### User-Specific Sidebar

When a user logs in:
1. Frontend calls `GET /api/v1/menus/my-menus`
2. API returns only menus where `can_view = true` for that user
3. Sidebar renders only those menus
4. User can't access menus they don't have permission for

## Next Steps

### Frontend Integration

You'll need to update the sidebar component to fetch menus dynamically:

```typescript
// In sidebar component
const [menus, setMenus] = useState([]);

useEffect(() => {
  fetchMyMenus();
}, []);

const fetchMyMenus = async () => {
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
};

// Render menus dynamically
{menus.map(menu => (
  <Link key={menu.id} href={menu.path}>
    {menu.label}
  </Link>
))}
```

### User Management Integration

Add a "Permissions" tab in the Users CRUD:
1. Show all available menus
2. Checkboxes for View, Create, Edit, Delete
3. Save button to update permissions via API

## Benefits

1. **No Code Changes** - Add new menus via API, no deployment needed
2. **Granular Control** - Per-user, per-menu permissions
3. **Auto-Admin Access** - Admins automatically get access to new menus
4. **Scalable** - Easy to add hundreds of menus
5. **Secure** - Backend enforces permissions
6. **Flexible** - Can create nested menus, reorder, enable/disable

## Testing

### Test 1: View Your Menus
```bash
curl -X GET "http://localhost:5000/api/v1/menus/my-menus" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Create New Menu
```bash
curl -X POST "http://localhost:5000/api/v1/menus" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-menu",
    "label": "Test Menu",
    "path": "/management/test",
    "icon": "IconTest",
    "sort_order": 99
  }'
```

### Test 3: Check Admin Got Permission
```bash
curl -X GET "http://localhost:5000/api/v1/menus/my-menus" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

You should see the new menu in the response!

## Troubleshooting

### Menu not showing in sidebar
- Check user has `can_view = true` permission
- Check menu `is_active = true`
- Check API response from `/my-menus`

### Permission not granted to admin
- Check trigger exists: `\df grant_admin_permissions_on_new_menu` in psql
- Check user `user_type = 'admin'` in users table

### Can't create menu
- Check unique constraint on `name` field
- Check required fields: name, label, path
