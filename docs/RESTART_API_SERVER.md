# Fix Applied - Profile Picture URLs

## What Was Fixed

The profile picture URLs were showing `localhost:8080` instead of the ngrok URL because the API server needed to be restarted to pick up the `BASE_URL` environment variable.

## Changes Made

1. **Updated `api/src/utils/urlHelper.js`**:
   - Added console logging to debug BASE_URL loading
   - The helper now correctly uses `BASE_URL` from environment

2. **Verified `.env` Configuration**:
   - `BASE_URL=https://occupiable-milissa-ennuyante.ngrok-free.dev` is set correctly

3. **Frontend Already Correct**:
   - `components/apps/contacts/components-apps-contacts-users.tsx` uses `buildMediaUrl()` from config
   - This correctly constructs URLs using `MEDIA_BASE_URL`

## How to Apply the Fix

### Step 1: Restart the API Server

```bash
# Stop the current API server (Ctrl+C if running)

# Start it again
cd api
npm start
```

### Step 2: Verify the Fix

1. **Check API Response**:
```bash
# Get a user and check the profile_picture URL
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "ngrok-skip-browser-warning: true" \
     https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users
```

The `profile_picture` field should now show:
```json
{
  "profile_picture": "https://occupiable-milissa-ennuyante.ngrok-free.dev/uploads/users/123/profile.jpg"
}
```

Instead of:
```json
{
  "profile_picture": "http://localhost:8080/uploads/users/123/profile.jpg"
}
```

2. **Check Frontend**:
   - Open: http://localhost:3000/management/users
   - Profile pictures should now load correctly
   - Inspect the image URLs in browser DevTools - they should use the ngrok URL

### Step 3: Test with Browser

1. Open http://localhost:3000/management/users
2. Right-click on a profile picture → "Inspect"
3. Check the `src` attribute - it should be:
   ```html
   <img src="https://occupiable-milissa-ennuyante.ngrok-free.dev/uploads/users/123/profile.jpg" />
   ```

## Why This Happened

The API server caches environment variables when it starts. When you update the `.env` file, you need to restart the server for changes to take effect.

## Verification Test

Run this to verify BASE_URL is loaded:
```bash
cd api
node test-base-url.js
```

Expected output:
```
BASE_URL: https://occupiable-milissa-ennuyante.ngrok-free.dev
getBaseUrl(): https://occupiable-milissa-ennuyante.ngrok-free.dev
```

## If Still Not Working

### Check 1: API Server Console
Look for this log when the API starts:
```
Using BASE_URL from environment: https://occupiable-milissa-ennuyante.ngrok-free.dev
```

If you see:
```
BASE_URL not found, using fallback: http://localhost:8080
```

Then the `.env` file is not being loaded. Make sure:
- File is named exactly `.env` (not `.env.txt`)
- File is in the `api/` directory
- No extra spaces in the variable: `BASE_URL=https://...` (no spaces around `=`)

### Check 2: Database Data
If old URLs are stored in the database, the `urlHelper` will convert them:
```javascript
// Old URL in database
"http://localhost:8080/uploads/users/123/profile.jpg"

// Converted to
"https://occupiable-milissa-ennuyante.ngrok-free.dev/uploads/users/123/profile.jpg"
```

This conversion happens automatically in `toAbsoluteUrl()` function.

### Check 3: Frontend Config
Verify `config/api.config.ts` has:
```typescript
export const MEDIA_BASE_URL = 'https://occupiable-milissa-ennuyante.ngrok-free.dev';
```

## Summary

✅ API `.env` has correct `BASE_URL`
✅ `urlHelper.js` uses `BASE_URL` from environment
✅ Frontend uses `buildMediaUrl()` with correct `MEDIA_BASE_URL`
✅ Old URLs in database are automatically converted

**Action Required**: Restart the API server!
