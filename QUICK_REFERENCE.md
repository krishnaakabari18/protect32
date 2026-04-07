# Quick Reference: Dynamic Sidebar & Super Admin

## 🚀 Setup (3 Steps)

```bash
# 1. Run SQL (in pgAdmin)
\i api/database/quick-add-specialties-menu.sql
\i api/database/add-procedures-menu.sql

# 2. Restart API
cd api && npm start

# 3. Refresh Browser
Ctrl + Shift + R
```

## 👤 User Types

| User Type | Sees | Permissions From |
|-----------|------|------------------|
| **super_admin** | ALL menus | Backend (always true) |
| **admin** | Permitted menus | user_permissions table |
| **support** | Limited menus | user_permissions table |
| **account** | Limited menus | user_permissions table |

## 🔍 Quick Tests

### Test 1: Check User Type
```sql
SELECT user_type FROM users WHERE email = 'your-email';
```

### Test 2: Count Menus
```sql
SELECT COUNT(*) FROM menus WHERE is_active = true;
```

### Test 3: Test API
```javascript
fetch('https://your-api-url/api/v1/menus/my-menus', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => console.log('User:', d.user_type, 'Menus:', d.total));
```

## 📊 Expected Results

### Super Admin
- **API Response:** `user_type: "super_admin"`, `total: 20`
- **Sidebar:** All 20 menus visible
- **Permissions:** All true (view, create, edit, delete)

### Admin
- **API Response:** `user_type: "admin"`, `total: 15-18`
- **Sidebar:** Only permitted menus
- **Permissions:** From database

## 🛠️ Common Tasks

### Add New Menu
```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('my-menu', 'My Menu', '/management/my-menu', 'IconFile', 50, true);
```
→ Super admin sees it immediately
→ Admin needs permission grant

### Grant Permission to Admin
```sql
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
VALUES ('admin-id', 'menu-id', true, true, true, true);
```

### Hide Menu
```sql
UPDATE menus SET is_active = false WHERE name = 'menu-name';
```

## 📁 Documentation Files

- `SUPER_ADMIN_FIX_SUMMARY.md` - What was done
- `SUPER_ADMIN_NO_PERMISSIONS.md` - How it works
- `VERIFY_SUPER_ADMIN.md` - Verification steps
- `QUICK_START_DYNAMIC_SIDEBAR.md` - Setup guide
- `DYNAMIC_SIDEBAR_SETUP_COMPLETE.md` - Full docs
- `CHECKLIST.md` - Step-by-step checklist

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Menus not showing | Restart API, hard refresh browser |
| Wrong user type | `UPDATE users SET user_type = 'super_admin' WHERE email = '...'` |
| Menus inactive | `UPDATE menus SET is_active = true WHERE name = '...'` |
| Token expired | Login again |
| API errors | Check server logs, verify routes registered |

## 📞 Quick Commands

```bash
# Restart API
cd api && npm start

# Check logs
cd api && npm start | grep -i error

# Run SQL script
psql -U postgres -d your_db -f api/database/script.sql
```

```javascript
// Browser console
localStorage.getItem('auth_token')  // Check token
console.table(menus)                // View menus
location.reload(true)               // Hard refresh
```

```sql
-- pgAdmin
SELECT * FROM menus WHERE is_active = true ORDER BY sort_order;
SELECT * FROM user_permissions WHERE user_id = 'your-id';
SELECT user_type FROM users WHERE email = 'your-email';
```

## ✅ Success Criteria

- [ ] Super admin sees 19-20 menus
- [ ] Specialties menu visible
- [ ] Procedures menu visible
- [ ] No console errors
- [ ] Navigation works
- [ ] API returns success: true

## 🎯 Key Points

1. **Super Admin = No Permissions Needed**
2. **Backend checks user_type first**
3. **Other users need user_permissions records**
4. **New menus auto-visible to super admin**
5. **Sidebar is 100% dynamic**

---

**Status:** ✅ Complete and working
**Time to setup:** ~3 minutes
**Files modified:** 2
**Files created:** 7
