# ✅ Dynamic Sidebar Implementation Checklist

## Pre-Flight Check

- [ ] PostgreSQL database is running
- [ ] pgAdmin is open and connected
- [ ] API server is stopped (will restart after SQL)
- [ ] Browser is open to your app

## Step 1: Database Setup (2 minutes)

### Option A: Run SQL Files
```bash
# In pgAdmin Query Tool:
\i api/database/quick-add-specialties-menu.sql
\i api/database/add-procedures-menu.sql
```

### Option B: Copy-Paste SQL
```sql
-- Add Specialties Menu
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Add Procedures Menu
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('procedures', 'Procedures', '/management/procedures', 'IconClipboardText', 3.5, true)
ON CONFLICT (name) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Grant Permissions to Admins
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

- [ ] SQL executed successfully
- [ ] No errors in pgAdmin

## Step 2: Verify Database (1 minute)

```sql
-- Run verification script
\i api/database/verify-dynamic-menu-setup.sql
```

Expected output:
- ✓ menus table exists
- ✓ user_permissions table exists
- ✓ Auto-permission trigger exists
- ✓ Specialties menu exists
- ✓ Procedures menu exists
- ✓✓✓ READY! Both Specialties and Procedures menus are set up.

- [ ] Verification passed
- [ ] Both menus show as "Found"

## Step 3: Restart API Server (30 seconds)

```bash
cd api
npm start
```

Wait for:
```
✓ Server running on port 5000
✓ Database connected
```

- [ ] API server started successfully
- [ ] No errors in console

## Step 4: Test API Endpoint (1 minute)

### Option A: Use Test HTML File
1. Open `test-my-menus-api.html` in browser
2. Click "Auto-fill Token from localStorage"
3. Click "Test API"
4. Check results

### Option B: Browser Console
```javascript
fetch('https://your-api-url/api/v1/menus/my-menus', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => {
    console.log('Total menus:', d.total);
    console.log('User type:', d.user_type);
    console.table(d.data);
});
```

Expected:
- success: true
- total: 19 or more
- data array contains specialties and procedures

- [ ] API returns success
- [ ] Specialties menu in response
- [ ] Procedures menu in response

## Step 5: Refresh Frontend (5 seconds)

Press: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

- [ ] Browser refreshed with cache cleared

## Step 6: Verify Sidebar (30 seconds)

Check left sidebar for:
- [ ] Dashboard (always visible)
- [ ] MANAGEMENT section header
- [ ] Users
- [ ] Patients
- [ ] Providers
- [ ] **Specialties** ⭐ (NEW - should have star icon)
- [ ] **Procedures** 📋 (NEW - should have clipboard icon)
- [ ] Appointments
- [ ] Treatment Plans
- [ ] Prescriptions
- [ ] Plans
- [ ] Treatment Fees
- [ ] Orders
- [ ] Documents
- [ ] Reviews
- [ ] Notifications
- [ ] Support Tickets
- [ ] Settings
- [ ] CMS Pages
- [ ] FAQs
- [ ] Patient Education

## Step 7: Test Navigation (1 minute)

- [ ] Click "Specialties" → Opens `/management/specialties`
- [ ] Click "Procedures" → Opens `/management/procedures`
- [ ] Both pages load without errors
- [ ] Can see list of items

## Step 8: Test Dynamic Behavior (2 minutes)

### Test 1: Add Test Menu
```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active)
VALUES ('test-menu', 'Test Menu', '/management/test', 'IconFile', 99, true);
```

- [ ] SQL executed
- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] "Test Menu" appears in sidebar

### Test 2: Hide Test Menu
```sql
UPDATE menus SET is_active = false WHERE name = 'test-menu';
```

- [ ] SQL executed
- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] "Test Menu" disappears from sidebar

### Test 3: Delete Test Menu
```sql
DELETE FROM menus WHERE name = 'test-menu';
```

- [ ] SQL executed
- [ ] Test menu removed

## Step 9: Test User Permissions (Optional)

If you have multiple users:

```sql
-- Remove view permission for a user
UPDATE user_permissions 
SET can_view = false 
WHERE user_id = 'some-user-id' 
  AND menu_id = (SELECT id FROM menus WHERE name = 'procedures');
```

- [ ] Login as that user
- [ ] Procedures menu not visible
- [ ] Other menus still visible

## Final Verification

- [ ] All menus display correctly
- [ ] Icons show properly
- [ ] Navigation works
- [ ] No console errors
- [ ] No API errors
- [ ] Dynamic behavior confirmed

## Troubleshooting

### If menus don't show:
1. Check browser console for errors
2. Check API server logs
3. Verify token: `localStorage.getItem('auth_token')`
4. Test API endpoint manually
5. Check database: `SELECT * FROM menus WHERE is_active = true;`

### If icons don't show:
1. Check icon name in database
2. Verify icon exists in `ICON_MAP` in sidebar component
3. Check browser console for import errors

### If permissions don't work:
1. Check user_type: `SELECT user_type FROM users WHERE email = 'your-email';`
2. Check permissions: `SELECT * FROM user_permissions WHERE user_id = 'your-id';`
3. Verify trigger: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_grant_admin_permissions';`

## Success Criteria

✅ Specialties menu visible in sidebar
✅ Procedures menu visible in sidebar
✅ Both menus clickable and functional
✅ Dynamic menu system working
✅ New menus appear automatically
✅ User permissions respected

## Documentation

- `QUICK_START_DYNAMIC_SIDEBAR.md` - Quick setup guide
- `DYNAMIC_SIDEBAR_SETUP_COMPLETE.md` - Detailed documentation
- `TASK_14_COMPLETE.md` - Implementation summary
- `test-my-menus-api.html` - API testing tool
- `api/database/verify-dynamic-menu-setup.sql` - Verification script

## Status

- [x] Code changes complete
- [ ] SQL scripts executed
- [ ] API server restarted
- [ ] Browser refreshed
- [ ] Menus verified
- [ ] Testing complete

## Time Estimate

Total time: ~7 minutes
- Database setup: 2 min
- Verification: 1 min
- API restart: 30 sec
- API test: 1 min
- Frontend refresh: 5 sec
- Sidebar verification: 30 sec
- Navigation test: 1 min
- Dynamic test: 2 min

## Next Steps After Completion

1. Test with different user types (admin, support, account)
2. Add more custom menus as needed
3. Consider building menu management UI
4. Update user permissions as needed
5. Monitor for any issues

---

**Ready to start? Begin with Step 1! 🚀**
