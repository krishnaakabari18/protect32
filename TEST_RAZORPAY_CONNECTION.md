# Test Razorpay Connection - Complete Guide

## Current Configuration ✅

Your setup is already correct:

### 1. API URL Configuration ✅
**File:** `.env.local`
```env
NEXT_PUBLIC_API_URL=https://occupiable-milissa-ennuyante.ngrok-free.dev
```

### 2. Settings Endpoint ✅
**File:** `config/api.config.ts`
```typescript
settings: `${API_BASE_URL}/settings`
// Resolves to: https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/settings
```

### 3. Test Razorpay Endpoint ✅
```
POST https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/settings/test-razorpay
```

### 4. Authentication ✅
**File:** `components/management/settings-crud.tsx`
```typescript
const token = localStorage.getItem('auth_token'); // Gets accessToken from login
headers: {
  'Authorization': `Bearer ${token}`,  // Sends as Bearer token
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
}
```

### 5. Login Token Storage ✅
**File:** `components/auth/components-auth-login-form.tsx`
```typescript
localStorage.setItem('auth_token', data.data.accessToken); // Stores accessToken
```

---

## Everything is Already Configured Correctly! ✅

The code is already:
- ✅ Using the correct ngrok URL
- ✅ Using the accessToken from login API
- ✅ Sending it as Bearer token
- ✅ Calling the correct endpoint

---

## How to Test

### Step 1: Make Sure You're Logged In
1. Go to login page
2. Login with your credentials
3. This stores the `accessToken` in `localStorage`

### Step 2: Go to Settings
1. Navigate to Settings page
2. Click on "Payment" tab

### Step 3: Enter Razorpay Credentials
```
Razorpay Key ID: rzp_test_RGayUf4jrYOXOT
Razorpay Key Secret: wlQKkIhATwdrOmf7ModT2jn9
```

### Step 4: Test Connection
1. Click "Test Razorpay Connection" button
2. Open browser console (F12)
3. Check the console logs

### Step 5: Check Console Output

You should see:
```javascript
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: true
Token length: 150
Token preview: eyJhbGciOiJIUzI1NiIs...
Endpoint: https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/settings/test-razorpay
Request body: {
  razorpay_key_id: "rzp_test_RGayUf4jrYOXOT",
  razorpay_key_secret: "wlQKkIhATwdrOmf7ModT2jn9"
}
Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
Response status: 200
Response ok: true
RAZORPAY Test Response: {
  success: true,
  message: "Razorpay connection successful. Credentials are valid."
}
```

---

## Manual Test (Using Browser Console)

If you want to test manually, open browser console (F12) and run:

```javascript
// Get the token
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Test the API
fetch('https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/settings/test-razorpay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    razorpay_key_id: 'rzp_test_RGayUf4jrYOXOT',
    razorpay_key_secret: 'wlQKkIhATwdrOmf7ModT2jn9'
  })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('OK:', r.ok);
  return r.json();
})
.then(d => {
  console.log('Response:', d);
  if (d.success) {
    console.log('✅ SUCCESS:', d.message);
  } else {
    console.log('❌ FAILED:', d.message);
  }
})
.catch(e => console.error('Error:', e));
```

---

## Expected Results

### If Everything Works:
```javascript
Status: 200
OK: true
Response: {
  success: true,
  message: "Razorpay connection successful. Credentials are valid.",
  key_id: "rzp_test_RGayUf4jrYOXOT"
}
✅ SUCCESS: Razorpay connection successful. Credentials are valid.
```

### If Token is Missing:
```javascript
=== TEST CONNECTION DEBUG ===
Token exists: false
[Error popup: "No authentication token found. Please login again."]
```
**Solution:** Login again

### If Token is Invalid:
```javascript
Status: 401
Response: {error: "No token provided"}
```
**Solution:** Login again to get fresh token

### If Razorpay Credentials are Wrong:
```javascript
Status: 400
Response: {
  success: false,
  message: "Razorpay connection failed: Authentication failed"
}
❌ FAILED: Razorpay connection failed: Authentication failed
```
**Solution:** Regenerate Razorpay keys in dashboard

---

## Troubleshooting

### Issue 1: "No token provided" Error
**Cause:** Token not being sent or invalid format

**Check:**
```javascript
// In console:
const token = localStorage.getItem('auth_token');
console.log('Token:', token);
console.log('Starts with eyJ:', token?.startsWith('eyJ'));
```

**Solution:**
- If token is null: Login again
- If token doesn't start with 'eyJ': Clear storage and login again
  ```javascript
  localStorage.clear();
  // Then login again
  ```

### Issue 2: "Authorization failed" in Response
**Cause:** Razorpay rejecting credentials (NOT auth token issue)

**Solution:**
1. Go to https://dashboard.razorpay.com/
2. Settings → API Keys
3. Regenerate Test Key
4. Update credentials in your app

### Issue 3: CORS Error
**Cause:** ngrok or API server CORS settings

**Solution:**
- Make sure API server is running
- Check API server has CORS enabled for ngrok URL
- Add 'ngrok-skip-browser-warning' header (already added)

---

## Verify Token Format

The token should be a JWT (JSON Web Token) that looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

It has 3 parts separated by dots (`.`):
1. Header (algorithm and type)
2. Payload (user data)
3. Signature (verification)

**Check in console:**
```javascript
const token = localStorage.getItem('auth_token');
console.log('Token parts:', token?.split('.').length); // Should be 3
console.log('Starts with eyJ:', token?.startsWith('eyJ')); // Should be true
```

---

## Complete Flow

```
1. User logs in
   ↓
2. Login API returns: {data: {accessToken: "eyJ...", user: {...}}}
   ↓
3. Frontend stores: localStorage.setItem('auth_token', accessToken)
   ↓
4. User goes to Settings → Payment
   ↓
5. User clicks "Test Razorpay Connection"
   ↓
6. Frontend gets: token = localStorage.getItem('auth_token')
   ↓
7. Frontend sends POST to:
   https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/settings/test-razorpay
   Headers: {Authorization: "Bearer eyJ..."}
   Body: {razorpay_key_id: "...", razorpay_key_secret: "..."}
   ↓
8. Backend verifies token (authenticate middleware)
   ↓
9. Backend tests Razorpay credentials
   ↓
10. Backend returns: {success: true/false, message: "..."}
    ↓
11. Frontend shows success/error popup
```

---

## Summary

**Your Configuration:** ✅ CORRECT

- ✅ API URL: `https://occupiable-milissa-ennuyante.ngrok-free.dev`
- ✅ Endpoint: `/api/v1/settings/test-razorpay`
- ✅ Token: Using `accessToken` from login
- ✅ Header: `Authorization: Bearer ${token}`
- ✅ Method: POST
- ✅ Body: Razorpay credentials

**What to Do:**
1. Make sure you're logged in
2. Go to Settings → Payment
3. Enter Razorpay credentials
4. Click "Test Razorpay Connection"
5. Check console for detailed logs

**If It Fails:**
- Check console logs for exact error
- Verify token exists: `localStorage.getItem('auth_token')`
- If "Authorization failed" → Regenerate Razorpay keys
- If "No token provided" → Login again

**The code is already correct!** Just need to:
1. Login to get fresh token
2. Test with valid Razorpay credentials
