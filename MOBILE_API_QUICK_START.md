# Mobile Registration API - Quick Start Guide

## Endpoint
```
POST /api/v1/auth/mobile-register
```

## Request
```json
{
  "mobile_number": "+919876543210",
  "full_name": "John Doe",
  "user_type": "patient"
}
```

## Response
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+919876543210",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "patient",
      "mobile_verified": false
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "note": "Please verify your mobile number using OTP"
  }
}
```

## Name Splitting Examples

| Input | First Name | Last Name |
|-------|------------|-----------|
| "John" | "John" | null |
| "John Doe" | "John" | "Doe" |
| "Amit Kumar Singh" | "Amit" | "Kumar Singh" |

## Required Fields
- ✅ `mobile_number` - Mobile with country code (e.g., +919876543210)
- ✅ `full_name` - Full name (will be split automatically)

## Optional Fields
- `user_type` - "patient" (default), "provider", or "admin"

## Next Steps After Registration
1. Send OTP: `POST /api/v1/auth/send-otp`
2. Verify OTP: `POST /api/v1/auth/verify-otp`
3. Use accessToken in Authorization header

## Test
```bash
./test-mobile-register-api.sh
```

## Swagger
http://localhost:8080/api-docs/

## Full Documentation
See: MOBILE_REGISTRATION_API.md
