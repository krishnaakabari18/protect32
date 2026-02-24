# OTP Quick Reference Card

## Default Test OTP
```
123456
```

## Configuration (.env)
```env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
```

## Complete Flow

### 1. Register
```bash
POST /api/v1/auth/mobile-register
{
  "mobile_number": "+919876543210",
  "full_name": "John Doe"
}
```

### 2. Send OTP
```bash
POST /api/v1/auth/send-otp
{
  "mobile_number": "+919876543210",
  "purpose": "mobile_verification"
}
```
**Check console logs for OTP (Test Mode: 123456)**

### 3. Verify OTP
```bash
POST /api/v1/auth/verify-otp
{
  "mobile_number": "+919876543210",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

## Purpose Values
- `registration` - New user
- `login` - Existing user
- `mobile_verification` - Verify mobile
- `password_reset` - Reset password

## Test Script
```bash
./test-otp-flow.sh
```

## Console Output (Test Mode)
```
🔐 TEST MODE: Using default OTP: 123456
📱 TEST MODE - OTP for +919876543210: 123456
   Use this OTP to verify: 123456
```

## Security
- ⏱️ Expires in 10 minutes
- 🔢 Max 3 attempts
- ✅ One-time use only
- 🔒 Purpose-based validation

## Swagger
http://localhost:8080/api-docs/

## Full Guide
See: OTP_TESTING_GUIDE.md
