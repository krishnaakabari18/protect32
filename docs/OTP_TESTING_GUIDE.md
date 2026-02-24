# OTP Testing Guide - Complete Documentation

## Overview
This guide explains how to test OTP functionality in development mode with a default test OTP code.

---

## Configuration

### Environment Variables (.env)

Add these to your `api/.env` file:

```env
# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

### Configuration Options

| Variable | Description | Default | Production |
|----------|-------------|---------|------------|
| OTP_LENGTH | Length of OTP code | 6 | 6 |
| OTP_EXPIRE_MINUTES | OTP expiry time in minutes | 10 | 10 |
| OTP_TEST_MODE | Enable test mode | true | false |
| OTP_TEST_CODE | Default OTP for testing | 123456 | N/A |

---

## Test Mode vs Production Mode

### Test Mode (Development)
**When:** `OTP_TEST_MODE=true`

**Features:**
- ✅ Always generates the same OTP: `123456`
- ✅ OTP is logged to console
- ✅ No SMS service required
- ✅ Perfect for development and testing
- ✅ No Twilio credentials needed

**Console Output:**
```
🔐 TEST MODE: Using default OTP: 123456
📱 TEST MODE - OTP for +919876543210: 123456
   Use this OTP to verify: 123456
```

### Production Mode
**When:** `OTP_TEST_MODE=false`

**Features:**
- Generates random 6-digit OTP
- Sends OTP via SMS (Twilio)
- Requires Twilio configuration
- OTP changes every time

**Required Twilio Configuration:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## Complete OTP Flow

### Step 1: Mobile Registration
**POST** `/api/v1/auth/mobile-register`

```json
{
  "mobile_number": "+919876543210",
  "full_name": "John Doe",
  "user_type": "patient"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+919876543210",
      "first_name": "John",
      "last_name": "Doe",
      "mobile_verified": false
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "note": "Please verify your mobile number using OTP"
  }
}
```

---

### Step 2: Send OTP
**POST** `/api/v1/auth/send-otp`

```json
{
  "mobile_number": "+919876543210",
  "purpose": "mobile_verification"
}
```

**Valid Purpose Values:**
- `registration` - For new user registration
- `login` - For existing user login
- `mobile_verification` - For verifying mobile number
- `password_reset` - For password reset

**Response:**
```json
{
  "message": "OTP sent successfully",
  "data": {
    "mobile_number": "+919876543210",
    "expires_in_minutes": "10"
  }
}
```

**In Test Mode:**
- Check API server console logs
- You'll see: `📱 TEST MODE - OTP for +919876543210: 123456`
- Use `123456` to verify

---

### Step 3: Verify OTP
**POST** `/api/v1/auth/verify-otp`

```json
{
  "mobile_number": "+919876543210",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+919876543210",
      "first_name": "John",
      "last_name": "Doe",
      "mobile_verified": true,
      "is_verified": true
    },
    "accessToken": "new_jwt_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

**Response (Error - Invalid OTP):**
```json
{
  "error": "Invalid or expired OTP"
}
```

**Response (Error - Too Many Attempts):**
```json
{
  "error": "Too many attempts. Please request a new OTP"
}
```

---

## Testing with cURL

### Complete Flow

```bash
# 1. Register User
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543210",
    "full_name": "John Doe"
  }'

# 2. Send OTP
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543210",
    "purpose": "mobile_verification"
  }'

# 3. Check server logs for OTP (in test mode, it's always 123456)

# 4. Verify OTP
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543210",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

## Testing with Test Script

Run the automated test script:

```bash
./test-otp-flow.sh
```

This script tests:
1. ✅ Mobile registration
2. ✅ Sending OTP
3. ✅ Verifying correct OTP
4. ✅ Rejecting wrong OTP

---

## OTP Database Schema

OTPs are stored in the `otps` table:

```sql
CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  mobile_number VARCHAR(20),
  email VARCHAR(255),
  otp_code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## OTP Security Features

### 1. Expiry Time
- Default: 10 minutes
- Configurable via `OTP_EXPIRE_MINUTES`
- Expired OTPs are automatically rejected

### 2. Attempt Limiting
- Maximum 3 attempts per OTP
- After 3 failed attempts, user must request new OTP
- Prevents brute force attacks

### 3. One-Time Use
- OTP is marked as verified after successful use
- Cannot be reused
- Must request new OTP for subsequent verifications

### 4. Purpose-Based
- Each OTP is tied to a specific purpose
- Cannot use registration OTP for login
- Prevents OTP misuse

---

## Mobile App Integration

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Step 1: Register
async function registerUser(mobileNumber, fullName) {
  const response = await fetch('http://localhost:8080/api/v1/auth/mobile-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile_number: mobileNumber,
      full_name: fullName
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens temporarily
    await AsyncStorage.setItem('tempAccessToken', data.data.accessToken);
    return data;
  }
  throw new Error(data.error);
}

// Step 2: Send OTP
async function sendOTP(mobileNumber) {
  const response = await fetch('http://localhost:8080/api/v1/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile_number: mobileNumber,
      purpose: 'mobile_verification'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    return data;
  }
  throw new Error(data.error);
}

// Step 3: Verify OTP
async function verifyOTP(mobileNumber, otpCode) {
  const response = await fetch('http://localhost:8080/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile_number: mobileNumber,
      otp_code: otpCode,
      purpose: 'mobile_verification'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store verified tokens
    await AsyncStorage.setItem('accessToken', data.data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
    await AsyncStorage.setItem('userId', data.data.user.id);
    return data;
  }
  throw new Error(data.error);
}

// Complete Flow
async function completeRegistration(mobileNumber, fullName, otpCode) {
  try {
    // 1. Register
    await registerUser(mobileNumber, fullName);
    
    // 2. Send OTP
    await sendOTP(mobileNumber);
    
    // 3. User enters OTP in UI
    // 4. Verify OTP
    const result = await verifyOTP(mobileNumber, otpCode);
    
    console.log('Registration complete!', result);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

---

## Troubleshooting

### Issue: OTP Not Received

**In Test Mode:**
1. Check API server console logs
2. Look for: `📱 TEST MODE - OTP for +919876543210: 123456`
3. Use the OTP shown in logs (default: 123456)

**In Production Mode:**
1. Verify Twilio credentials are correct
2. Check Twilio account balance
3. Verify phone number format (+country_code)
4. Check API server logs for errors

### Issue: "Invalid or expired OTP"

**Possible Causes:**
1. OTP has expired (>10 minutes old)
2. Wrong OTP code entered
3. OTP already used
4. Purpose mismatch

**Solution:**
- Request a new OTP using `/auth/send-otp`
- Use the new OTP code

### Issue: "Too many attempts"

**Cause:**
- Failed verification 3 times

**Solution:**
- Request a new OTP using `/auth/send-otp`
- Verify with correct OTP

### Issue: "User not found"

**Cause:**
- Using `purpose: "login"` for non-existent user

**Solution:**
- Use `purpose: "registration"` for new users
- Or register user first with `/auth/mobile-register`

---

## Best Practices

### For Development
1. ✅ Use `OTP_TEST_MODE=true`
2. ✅ Use default OTP: `123456`
3. ✅ Check console logs for OTP
4. ✅ No SMS service needed

### For Production
1. ✅ Set `OTP_TEST_MODE=false`
2. ✅ Configure Twilio credentials
3. ✅ Use HTTPS for API calls
4. ✅ Implement rate limiting
5. ✅ Log OTP attempts for security
6. ✅ Monitor failed attempts

### For Mobile Apps
1. ✅ Auto-read SMS (Android)
2. ✅ Show countdown timer (10 minutes)
3. ✅ Allow resend OTP option
4. ✅ Validate OTP format (6 digits)
5. ✅ Handle network errors gracefully
6. ✅ Clear OTP input on error

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth/mobile-register` | POST | Register user | No |
| `/auth/send-otp` | POST | Send OTP | No |
| `/auth/verify-otp` | POST | Verify OTP | No |
| `/auth/refresh-token` | POST | Refresh token | No |
| `/auth/profile` | GET | Get profile | Yes |

---

## Swagger Documentation

Access complete API documentation:
**http://localhost:8080/api-docs/**

Look for:
- Authentication section
- POST `/auth/send-otp`
- POST `/auth/verify-otp`

---

## Quick Reference

### Default Test OTP
```
123456
```

### OTP Expiry
```
10 minutes
```

### Max Attempts
```
3 attempts
```

### Test Mobile Number
```
+919876543210
```

### Test Script
```bash
./test-otp-flow.sh
```

---

## Changelog

### Version 1.0.0 (February 24, 2026)
- ✅ Test mode implementation
- ✅ Default OTP: 123456
- ✅ Console logging
- ✅ Support for mobile_verification purpose
- ✅ Complete test script
- ✅ Documentation

---

**Status:** Production Ready ✓

**Last Updated:** February 24, 2026
