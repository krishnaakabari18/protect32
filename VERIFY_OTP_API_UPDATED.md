# Verify OTP API - Updated Documentation

## Overview
The verify-otp API Swagger documentation has been updated to include the `mobile_verification` purpose.

---

## API Endpoint

**POST** `/api/v1/auth/verify-otp`

---

## Request Schema

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| mobile_number | string | Mobile number with country code | "+1234567890" |
| otp_code | string | 6-digit OTP code | "123456" |
| purpose | enum | Purpose of verification | "mobile_verification" |

### Purpose Values

| Value | Description | Use Case |
|-------|-------------|----------|
| `registration` | Create new user | New user registration via OTP |
| `login` | Authenticate user | Existing user login via OTP |
| `password_reset` | Reset password | Password recovery flow |
| `mobile_verification` | Verify mobile number | Verify mobile after registration |

---

## Request Examples

### 1. Mobile Verification (Most Common)

**Use Case:** After mobile registration, verify the user's mobile number

```json
{
  "mobile_number": "+1234567823",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

**cURL:**
```bash
curl -X POST https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567823",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

### 2. Login Verification

**Use Case:** User logging in with OTP

```json
{
  "mobile_number": "+1234567890",
  "otp_code": "123456",
  "purpose": "login"
}
```

---

### 3. Registration Verification

**Use Case:** Creating new user with OTP (includes user data)

```json
{
  "mobile_number": "+1234567890",
  "otp_code": "123456",
  "purpose": "registration",
  "user_data": {
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "patient",
    "password": "optional_password"
  }
}
```

---

### 4. Password Reset Verification

**Use Case:** Verifying OTP for password reset

```json
{
  "mobile_number": "+1234567890",
  "otp_code": "123456",
  "purpose": "password_reset"
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+1234567823",
      "first_name": "John",
      "last_name": "Doe",
      "mobile_verified": true,
      "is_verified": true,
      "user_type": "patient",
      "is_active": true,
      "created_at": "2026-02-24T...",
      "updated_at": "2026-02-24T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Invalid or Expired OTP (400 Bad Request)
```json
{
  "error": "Invalid or expired OTP"
}
```

#### Too Many Attempts (400 Bad Request)
```json
{
  "error": "Too many attempts. Please request a new OTP"
}
```

#### User Not Found (404 Not Found)
```json
{
  "error": "User not found"
}
```

---

## Complete Flow with Mobile Verification

### Step 1: Register User
```bash
POST /api/v1/auth/mobile-register
{
  "mobile_number": "+1234567823",
  "full_name": "John Doe",
  "user_type": "patient"
}
```

**Response:**
- User created
- OTP automatically sent
- Returns: `otp_sent: true`

---

### Step 2: Verify OTP
```bash
POST /api/v1/auth/verify-otp
{
  "mobile_number": "+1234567823",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

**Response:**
- User verified
- `mobile_verified: true`
- `is_verified: true`
- New tokens returned

---

## Swagger Documentation

### Access Swagger UI
```
http://localhost:8080/api-docs/
https://abbey-stateliest-treva.ngrok-free.dev/api-docs/
```

### Updated Schema

The Swagger schema now includes:

1. **Purpose Enum:**
   - registration
   - login
   - password_reset
   - mobile_verification ✨ NEW

2. **Example Values:**
   - mobile_number: "+1234567890"
   - otp_code: "123456"
   - purpose: "mobile_verification"

3. **Detailed Descriptions:**
   - Each purpose explained
   - Use cases documented
   - Response schemas defined

4. **Error Responses:**
   - 400: Invalid or expired OTP
   - 404: User not found

---

## Testing

### Test Mode Configuration

In `api/.env`:
```env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

### Test Script

```bash
./test-verify-otp-swagger.sh
```

### Manual Test with cURL

```bash
# 1. Register user (OTP sent automatically)
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567823",
    "full_name": "John Doe"
  }'

# 2. Verify OTP with mobile_verification purpose
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567823",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

## Mobile App Integration

### React Native Example

```javascript
// Verify OTP after registration
async function verifyMobileNumber(mobileNumber, otpCode) {
  try {
    const response = await fetch(
      'https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/verify-otp',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          otp_code: otpCode,
          purpose: 'mobile_verification'  // ← Use this purpose
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Store verified tokens
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      
      console.log('Mobile verified:', data.data.user.mobile_verified);
      console.log('User verified:', data.data.user.is_verified);
      
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}
```

### Flutter Example

```dart
Future<Map<String, dynamic>> verifyMobileNumber(
  String mobileNumber, 
  String otpCode
) async {
  final response = await http.post(
    Uri.parse('https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/verify-otp'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'mobile_number': mobileNumber,
      'otp_code': otpCode,
      'purpose': 'mobile_verification',  // ← Use this purpose
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    
    // Store verified tokens
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', data['data']['accessToken']);
    await prefs.setString('refreshToken', data['data']['refreshToken']);
    
    print('Mobile verified: ${data['data']['user']['mobile_verified']}');
    print('User verified: ${data['data']['user']['is_verified']}');
    
    return data;
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['error']);
  }
}
```

---

## Purpose Comparison

| Purpose | Creates User | Requires Existing User | Updates mobile_verified | Use After |
|---------|--------------|------------------------|-------------------------|-----------|
| registration | ✅ Yes | ❌ No | ✅ Yes | N/A |
| login | ❌ No | ✅ Yes | ✅ Yes | User exists |
| mobile_verification | ❌ No | ✅ Yes | ✅ Yes | mobile-register |
| password_reset | ❌ No | ✅ Yes | ❌ No | Forgot password |

---

## Best Practices

### 1. Use Correct Purpose
```javascript
// ✅ Correct - After mobile registration
purpose: "mobile_verification"

// ❌ Wrong - Don't use login for verification
purpose: "login"
```

### 2. Handle Errors Gracefully
```javascript
try {
  await verifyOTP(mobile, otp);
} catch (error) {
  if (error.message.includes('expired')) {
    // Show "OTP expired, request new one"
  } else if (error.message.includes('Invalid')) {
    // Show "Invalid OTP, try again"
  } else if (error.message.includes('attempts')) {
    // Show "Too many attempts, request new OTP"
  }
}
```

### 3. Update UI After Verification
```javascript
const result = await verifyOTP(mobile, otp);

if (result.data.user.mobile_verified) {
  // Show success message
  // Navigate to home screen
  // Update user profile in state
}
```

---

## Security Notes

1. **OTP Expiry:** 10 minutes (configurable)
2. **Max Attempts:** 3 attempts per OTP
3. **One-Time Use:** OTP cannot be reused
4. **Purpose Validation:** OTP purpose must match
5. **Test Mode:** Use `123456` only in development

---

## Related Documentation

- `AUTO_OTP_REGISTRATION_GUIDE.md` - Auto OTP registration flow
- `OTP_TESTING_GUIDE.md` - Complete OTP testing guide
- `MOBILE_REGISTRATION_API.md` - Mobile registration API
- `MOBILE_APP_COMPLETE_GUIDE.md` - Mobile app integration

---

## Changelog

### Version 1.1.0 (February 24, 2026)
- ✅ Added `mobile_verification` to purpose enum
- ✅ Updated Swagger documentation
- ✅ Added detailed examples
- ✅ Improved error response documentation
- ✅ Added mobile app integration examples

---

**Status:** Production Ready ✓

**Last Updated:** February 24, 2026

**Swagger URL:** http://localhost:8080/api-docs/
