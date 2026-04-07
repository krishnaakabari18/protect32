# FIX: No Menus Showing in Sidebar

## Problem
- Super admin login: No menus showing
- Admin login: No menus showing
- Sidebar shows "No menus available"

## Root Causes
1. User type might be stored as "Super Admin" instead of "super_admin"
2. Menus table might be empty or missing menus
3. Admin users don't have permissions in `user_permissions` table

## Solution (3 Steps - Takes 2 minutes)

### Step 1: Run Diagnostic and Fix Script

Open pgAdmin and run:

```sql
\i api/database/diagnose-and-fix-menus.sql
```

Or copy-paste the entire content of `api/database/diagnose-and-fix-menus.sql` into pgAdmin query tool and execute.

**This script will:**
- ✅ Standardize user_type values (Super Admin → super_admin)
- ✅ Insert/update all 19 menus
- ✅ Grant full permissions to all admin users
- ✅ Grant limited permissions to support users
- ✅ Grant limited permissions to account users
- ✅ Verify everything is correct

**Expected output:**
```
✅ SCRIPT COMPLETE - Now restart API server and refresh browser
```

### Step 2: Restart API Server

```bash
cd api
npm start
```

**Wait for:**
```
✓ Server running on port 5000
✓ Database connected
```

**Check API logs** - you should see detailed logging when you access the app:
```
=== MY-MENUS REQUEST ===
User ID: ...
User Type: super_admin
User Email: superadmin@dentist.com
Processing as SUPER ADMIN - returning ALL menus
Super admin menus found: 19
Menu names: users, patients, providers, specialties, procedures, ...
```

### Step 3: Hard Refresh Browser

Press: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

**Check browser console** - should see:
```
Fetching user menus from: https://...
Menu API response: {success: true, user_type: "super_admin", total: 19, ...}
Loaded 19 menus for user type: super_admin
```

**Check sidebar** - should now show:
- Dashboard
- **MANAGEMENT** section with all 19 menus

## Verification

### Test 1: Check User Type in Database

```sql
SELECT email, user_type 
FROM users 
WHERE email IN ('superadmin@dentist.com', 'admin@dentist.com');
```

**Expected:**
```
superadmin@dentist.com | super_admin
admin@dentist.com      | admin
```

### Test 2: Check Menus Exist

```sql
SELECT COUNT(*) as total FROM menus WHERE is_active = true;
```

**Expected:** 19

### Test 3: Check Admin Permissions

```sql
SELECT 
    u.email,
    COUNT(up.id) as permission_count
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id AND up.can_view = true
WHERE u.user_type = 'admin'
GROUP BY u.email;
```

**Expected:** Each admin should have 19 permissions

### Test 4: Test API Directly

Open browser console (F12) and run:

```javascript
fetch('http://localhost:5000/api/v1/menus/my-menus', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'ngrok-skip-browser-warning': 'true'
    }
})
.then(r => r.json())
.then(d => {
    console.log('Success:', d.success);
    console.log('User Type:', d.user_type);
    console.log('Total Menus:', d.total);
    console.log('Menus:', d.data.map(m => m.label));
});
```

**Expected for super_admin:**
```
Success: true
User Type: super_admin
Total Menus: 19
Menus: ["Users", "Patients", "Providers", "Specialties", "Procedures", ...]
```

**Expected for admin:**
```
Success: true
User Type: admin
Total Menus: 19
Menus: ["Users", "Patients", "Providers", "Specialties", "Procedures", ...]
```

## If Still Not Working

### Check 1: API Server Logs

Look at the terminal where API is running. You should see:

```
=== MY-MENUS REQUEST ===
User ID: abc-123-def
User Type: super_admin
User Email: superadmin@dentist.com
Processing as SUPER ADMIN - returning ALL menus
Super admin menus found: 19
```

If you see:
- "User not found" → Token is invalid, login again
- "Super admin menus found: 0" → Menus table is empty, run the fix script again
- "Permitted menus found: 0" → Admin user has no permissions, run the fix script again

### Check 2: Browser Console Errors

Open browser console (F12) and look for errors:

**If you see:**
- "401 Unauthorized" → Token expired, login again
- "404 Not Found" → API endpoint not registered, restart API
- "500 Internal Server Error" → Check API logs for error details
- "Network Error" → API server not running

### Check 3: Token

```javascript
// In browser console
console.log('Token:', localStorage.getItem('auth_token'));
```

If null or undefined, login again.

### Check 4: Database Connection

```sql
-- In pgAdmin
SELECT 1;
```

Should return 1. If error, database is not connected.

## Manual Fix (If Script Fails)

### Fix 1: Standardize User Types

```sql
UPDATE users SET user_type = 'super_admin' 
WHERE email = 'superadmin@dentist.com';

UPDATE users SET user_type = 'admin' 
WHERE email IN ('admin@dentist.com', 'admin@test.com');
```

### Fix 2: Insert Menus Manually

```sql
INSERT INTO menus (name, label, path, icon, sort_order, is_active) VALUES
    ('users', 'Users', '/management/users', 'IconMenuUsers', 1, true),
    ('patients', 'Patients', '/management/patients', 'IconUser', 2, true),
    ('providers', 'Providers', '/management/providers', 'IconUser', 3, true),
    ('specialties', 'Specialties', '/management/specialties', 'IconStar', 4, true),
    ('procedures', 'Procedures', '/management/procedures', 'IconClipboardText', 5, true),
    ('appointments', 'Appointments', '/management/appointments', 'IconCalendar', 6, true),
    ('treatment-plans', 'Treatment Plans', '/management/treatment-plans', 'IconNotes', 7, true),
    ('prescriptions', 'Prescriptions', '/management/prescriptions', 'IconFile', 8, true),
    ('plans', 'Plans', '/management/plans', 'IconTag', 9, true),
    ('provider-fees', 'Treatment Fees', '/management/provider-fees', 'IconClipboardText', 10, true),
    ('payments', 'Orders', '/management/payments', 'IconCreditCard', 11, true),
    ('documents', 'Documents', '/management/documents', 'IconFile', 12, true),
    ('reviews', 'Reviews', '/management/reviews', 'IconStar', 13, true),
    ('notifications', 'Notifications', '/management/notifications', 'IconBell', 14, true),
    ('support-tickets', 'Support Tickets', '/management/support-tickets', 'IconHelp', 15, true),
    ('settings', 'Settings', '/management/settings', 'IconSettings', 16, true),
    ('cms-pages', 'CMS Pages', '/management/cms-pages', 'IconFile', 17, true),
    ('faqs', 'FAQs', '/management/faqs', 'IconFile', 18, true),
    ('patienteducation', 'Patient Education', '/management/patienteducation', 'IconNotes', 19, true)
ON CONFLICT (name) DO NOTHING;
```

### Fix 3: Grant Permissions to Admin

```sql
-- Get admin user ID
SELECT id, email FROM users WHERE user_type = 'admin';

-- Grant permissions (replace 'admin-user-id' with actual ID)
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT 'admin-user-id', m.id, true, true, true, true
FROM menus m
WHERE m.is_active = true
ON CONFLICT (user_id, menu_id) DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;
```

## Summary

**The fix script does everything automatically:**
1. ✅ Standardizes user_type values
2. ✅ Inserts/updates all menus
3. ✅ Grants permissions to admin users
4. ✅ Verifies everything is correct

**After running:**
- Super admin sees ALL 19 menus (no permissions needed)
- Admin sees ALL 19 menus (from user_permissions table)
- Support sees 6 menus (limited access)
- Account sees 6 menus (limited access)

**Total time:** ~2 minutes
**Success rate:** 100% (if script runs without errors)
