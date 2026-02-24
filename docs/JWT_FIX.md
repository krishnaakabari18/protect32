# JWT Configuration Fix

## Problem

Error when logging in:
```
Error! "expiresIn" should be a number of seconds or string representing a timespan
```

## Root Cause

The JWT utility (`api/src/utils/jwt.js`) was looking for environment variables:
- `JWT_EXPIRE` 
- `JWT_REFRESH_EXPIRE`

But the `.env` file had:
- `JWT_EXPIRES_IN` (wrong variable name)

This caused the `expiresIn` parameter to be `undefined`, which triggered the error.

## Solution Applied

### 1. Updated `.env` File

Changed from:
```env
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

To:
```env
JWT_SECRET=your-secret-key-here-change-in-production-dentist-management-system-2024
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### 2. Restarted API Server

The API server was restarted to load the new environment variables.

## JWT Configuration Explained

### JWT_SECRET
- Used to sign and verify JWT tokens
- Should be a long, random string
- **MUST be changed in production!**
- Current: `your-secret-key-here-change-in-production-dentist-management-system-2024`

### JWT_EXPIRE
- Access token expiration time
- Format: `7d` (7 days), `24h` (24 hours), `3600` (3600 seconds)
- Current: `7d` (7 days)
- Shorter expiration = more secure, but users need to login more often

### JWT_REFRESH_EXPIRE
- Refresh token expiration time
- Should be longer than access token
- Current: `30d` (30 days)
- Used to get new access tokens without re-login

## Valid Time Formats

The `expiresIn` parameter accepts:

### String Format (Recommended)
- `"60s"` - 60 seconds
- `"5m"` - 5 minutes
- `"2h"` - 2 hours
- `"7d"` - 7 days
- `"30d"` - 30 days

### Number Format
- `60` - 60 seconds
- `3600` - 1 hour (3600 seconds)
- `86400` - 1 day (86400 seconds)

## Testing

### Test Login API

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Expected Response

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "user_type": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test with Script

```bash
./test-login.sh
```

## JWT Utility Code

The JWT utility (`api/src/utils/jwt.js`) uses these environment variables:

```javascript
class JWTUtil {
  static generateAccessToken(userId, userType) {
    return jwt.sign(
      { userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }  // ← Uses JWT_EXPIRE
    );
  }

  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }  // ← Uses JWT_REFRESH_EXPIRE
    );
  }
}
```

## Production Recommendations

### 1. Change JWT_SECRET

Generate a strong secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### 2. Adjust Expiration Times

For production, consider:
```env
JWT_EXPIRE=15m          # 15 minutes for access token
JWT_REFRESH_EXPIRE=7d   # 7 days for refresh token
```

This is more secure but requires implementing token refresh logic in the frontend.

### 3. Use Environment-Specific Configs

```env
# Development
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

## Troubleshooting

### Error: "jwt malformed"
- Token is invalid or corrupted
- Check if JWT_SECRET matches between token generation and verification

### Error: "jwt expired"
- Token has expired
- Use refresh token to get a new access token
- Or login again

### Error: "invalid signature"
- JWT_SECRET doesn't match
- Token was signed with a different secret

## Current Configuration

✅ **JWT_SECRET**: Set (change in production!)
✅ **JWT_EXPIRE**: 7d (7 days)
✅ **JWT_REFRESH_EXPIRE**: 30d (30 days)
✅ **API Server**: Restarted with new config
✅ **Login**: Should now work correctly

## Verify Fix

1. **Restart API server** (already done)
2. **Try logging in** at http://localhost:3002/auth/boxed-signin
3. **Should see**: Successful login and redirect to dashboard
4. **Token should be**: Stored in localStorage

---

**The JWT configuration is now correct and login should work!** ✅
