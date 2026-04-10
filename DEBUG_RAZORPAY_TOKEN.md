# Debug: Razorpay Test with Token

## What I Added

I've added comprehensive debugging to the settings component to help identify the exact issue.

## Changes Made

### 1. Token Validation
- ✅ Checks if token exists before making request
- ✅ Shows error if no token found
- ✅ Logs token details (length, preview)

### 2. Request Debugging
- ✅ Logs endpoint URL
- ✅ Logs request body
- ✅ Logs authorization header (partial)

### 3. Response Debugging
- ✅ Logs response status
- ✅ Logs response data
- ✅ Logs success/error messages
- ✅ Logs full error stack

---

## How to Debug

### Step 1: Refresh Browser
```
Press: Ctrl + Shift + R
```

### Step 2: Open Console
```
Press: F12
Click: Console tab
```

### Step 3: Test Razorpay
1. Go to Settings → Payment tab
2. Enter Razorpay credentials
3. Click "Test Razorpay Connection"
4. Watch console output

### Step 4: Check Console Output

You should see something like:

```javascript
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: true
Token length: 150
Token preview: eyJhbGciOiJIUzI1NiIs...

Endpoint: https://your-api.com/api/v1/settings/test-razorpay
Request body: {
  razorpay_key_id: "rzp_test_...",
  razorpay_key_secret: "..."
}
Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...

Response status: 200
Response ok: true
RAZORPAY Test Response: {
  success: true,
  message: "Razorpay connection successful"
}
```

---

## What to Look For

### Check 1: Token Exists?
```javascript
Token exists: true  ← Should be true
Token length: 150   ← Should be > 0
```

**If false:**
- You're not logged in
- Token was cleared
- Login again

### Check 2: Request Sent?
```javascript
Endpoint: https://...  ← Should show full URL
Request body: {...}    ← Should show credentials
```

**If missing:**
- JavaScript error before request
- Check for errors above this

### Check 3: Response Status?
```javascript
Response status: 200  ← Should be 200 for success
Response ok: true     ← Should be true
```

**If 401:**
- Token is invalid/expired
- Login again

**If 400:**
- Razorpay credentials invalid
- Check Razorpay dashboard

**If 500:**
- Server error
- Check API server logs

### Check 4: Response Data?
```javascript
RAZORPAY Test Response: {
  success: false,
  message: "Razorpay connection failed: [error]"
}
```

The message will tell you exactly what's wrong!

---

## Common Issues & Solutions

### Issue 1: Token Exists = false
**Cause:** Not logged in or token cleared

**Solution:**
```
1. Logout
2. Login again
3. Go to Settings
4. Test again
```

### Issue 2: Response Status = 401
**Cause:** Token expired or invalid

**Solution:**
```
1. Check token in console:
   localStorage.getItem('auth_token')
2. If null or short, login again
3. If exists, token might be expired
4. Login again to get fresh token
```

### Issue 3: Response Status = 400
**Cause:** Razorpay credentials invalid

**Solution:**
```
1. Go to Razorpay Dashboard
2. Regenerate test keys
3. Update in settings
4. Test again
```

### Issue 4: "Authorization failed" in message
**Cause:** Razorpay rejecting credentials

**Solution:**
```
This is NOT an auth token issue!
This is Razorpay saying your credentials are wrong.

Fix:
1. Regenerate Razorpay keys
2. Make sure test mode is ON
3. Verify account is activated
```

---

## Test Token Manually

### In Browser Console:

```javascript
// Check if token exists
const token = localStorage.getItem('auth_token');
console.log('Token:', token);
console.log('Token length:', token?.length);

// Test API with token
fetch('https://your-api.com/api/v1/settings/test-razorpay', {
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
  return r.json();
})
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

---

## Expected Console Output

### If Token is Valid:
```
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: true
Token length: 150
Token preview: eyJhbGciOiJIUzI1NiIs...
Endpoint: https://...
Request body: {...}
Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
Response status: 200
Response ok: true
RAZORPAY Test Response: {success: true, message: "..."}
```

### If Token is Missing:
```
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: false
Token length: undefined
Token preview: undefined
[Error popup: "No authentication token found"]
```

### If Token is Invalid:
```
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: true
Token length: 150
Token preview: eyJhbGciOiJIUzI1NiIs...
Endpoint: https://...
Request body: {...}
Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
Response status: 401
Response ok: false
RAZORPAY Test Response: {error: "No token provided"}
```

### If Razorpay Credentials Invalid:
```
=== TEST CONNECTION DEBUG ===
Type: razorpay
Token exists: true
Token length: 150
Token preview: eyJhbGciOiJIUzI1NiIs...
Endpoint: https://...
Request body: {...}
Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
Response status: 400
Response ok: false
RAZORPAY Test Response: {
  success: false,
  message: "Razorpay connection failed: Authentication failed"
}
```

---

## Action Steps

### Step 1: Refresh & Test
```
1. Refresh browser (Ctrl+Shift+R)
2. Open console (F12)
3. Go to Settings → Payment
4. Click "Test Razorpay Connection"
5. Read console output
```

### Step 2: Share Console Output
If still failing, share:
```
1. All console logs starting with "=== TEST CONNECTION DEBUG ==="
2. The full "RAZORPAY Test Response" object
3. Any red error messages
```

### Step 3: Verify Token
```javascript
// In console:
localStorage.getItem('auth_token')
// Should return a long string starting with "eyJ..."
```

### Step 4: Re-login if Needed
```
If token is null or invalid:
1. Logout
2. Login again
3. Test again
```

---

## Summary

**What I Added:**
- ✅ Token validation before request
- ✅ Comprehensive console logging
- ✅ Request/response debugging
- ✅ Error stack traces

**What to Do:**
1. Refresh browser
2. Open console
3. Test Razorpay
4. Read console output
5. Share output if still failing

**Most Likely Issues:**
1. Token missing → Login again
2. Token expired → Login again
3. Razorpay credentials invalid → Regenerate keys

The console logs will tell us exactly what's happening! 🔍
