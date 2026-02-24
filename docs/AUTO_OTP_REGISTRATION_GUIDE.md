# Auto OTP Registration - Complete Guide

## Overview
The mobile registration API now automatically sends OTP after successful registration, eliminating the need for a separate `/send-otp` API call.

---

## What Changed?

### Before (3 API Calls)
```
1. POST /auth/mobile-register  → Register user
2. POST /auth/send-otp         → Send OTP manually
3. POST /auth/verify-otp       → Verify OTP
```

### After (2 API Calls) ✅
```
1. POST /auth/mobile-register  → Register user + Auto send OTP
2. POST /auth/verify-otp       → Verify OTP
```

---

## API Endpoint

### POST `/api/v1/auth/mobile-register`

**Request:**
```json
{
  "mobile_number": "+1234567890",
  "full_name": "John Doe",
  "user_type": "patient"
}
```

**Response:**
```json
{
  "message": "User registered successfully. OTP sent to your mobile number.",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+1234567890",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "patient",
      "mobile_verified": false,
      "is_verified": false,
      "created_at": "2026-02-24T..."
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "otp_sent": true,
    "otp_expires_in_minutes": 10,
    "note": "Please verify your mobile number using the OTP sent to your phone"
  }
}
```

---

## Complete Flow

### Step 1: Register User (OTP Sent Automatically)

**cURL Example:**
```bash
curl -X POST https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/mobile-register \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "full_name": "John Doe",
    "user_type": "patient"
  }'
```

**What Happens:**
1. ✅ User is created in database
2. ✅ JWT tokens are generated
3. ✅ OTP is automatically generated (123456 in test mode)
4. ✅ OTP is sent to mobile number
5. ✅ OTP is stored in database with 10-minute expiry
6. ✅ Response includes `otp_sent: true`

**Check Server Logs (Test Mode):**
```
🔐 TEST MODE: Using default OTP: 123456
📱 TEST MODE - OTP for +1234567890: 123456
   Use this OTP to verify: 123456
```

---

### Step 2: Verify OTP

**cURL Example:**
```bash
curl -X POST https://abbey-stateliest-treva.ngrok-free.dev/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_number": "+1234567890",
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

---

## Mobile App Integration

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://abbey-stateliest-treva.ngrok-free.dev/api/v1';

// Step 1: Register (OTP sent automatically)
async function registerUser(mobileNumber, fullName) {
  try {
    const response = await fetch(`${API_URL}/auth/mobile-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile_number: mobileNumber,
        full_name: fullName,
        user_type: 'patient'
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store tokens temporarily
      await AsyncStorage.setItem('tempAccessToken', data.data.accessToken);
      await AsyncStorage.setItem('tempRefreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('userId', data.data.user.id);
      
      // Check if OTP was sent
      if (data.data.otp_sent) {
        console.log('OTP sent successfully');
        console.log(`OTP expires in ${data.data.otp_expires_in_minutes} minutes`);
        
        // Navigate to OTP verification screen
        navigation.navigate('OTPVerification', {
          mobile_number: mobileNumber,
          otp_expires_in: data.data.otp_expires_in_minutes
        });
      }
      
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Step 2: Verify OTP
async function verifyOTP(mobileNumber, otpCode) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
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
      
      // Clear temp tokens
      await AsyncStorage.removeItem('tempAccessToken');
      await AsyncStorage.removeItem('tempRefreshToken');
      
      console.log('User verified successfully');
      
      // Navigate to home screen
      navigation.navigate('Home');
      
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
}

// Complete Registration Flow
async function completeRegistration(mobileNumber, fullName, otpCode) {
  try {
    // Step 1: Register (OTP sent automatically)
    await registerUser(mobileNumber, fullName);
    
    // Step 2: User enters OTP in UI
    // Step 3: Verify OTP
    await verifyOTP(mobileNumber, otpCode);
    
    console.log('Registration complete!');
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

---

### Flutter Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

const String API_URL = 'https://abbey-stateliest-treva.ngrok-free.dev/api/v1';

// Step 1: Register (OTP sent automatically)
Future<Map<String, dynamic>> registerUser(String mobileNumber, String fullName) async {
  final response = await http.post(
    Uri.parse('$API_URL/auth/mobile-register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'mobile_number': mobileNumber,
      'full_name': fullName,
      'user_type': 'patient',
    }),
  );

  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    
    // Store tokens temporarily
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('tempAccessToken', data['data']['accessToken']);
    await prefs.setString('tempRefreshToken', data['data']['refreshToken']);
    await prefs.setString('userId', data['data']['user']['id']);
    
    // Check if OTP was sent
    if (data['data']['otp_sent'] == true) {
      print('OTP sent successfully');
      print('OTP expires in ${data['data']['otp_expires_in_minutes']} minutes');
    }
    
    return data;
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['error']);
  }
}

// Step 2: Verify OTP
Future<Map<String, dynamic>> verifyOTP(String mobileNumber, String otpCode) async {
  final response = await http.post(
    Uri.parse('$API_URL/auth/verify-otp'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'mobile_number': mobileNumber,
      'otp_code': otpCode,
      'purpose': 'mobile_verification',
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    
    // Store verified tokens
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', data['data']['accessToken']);
    await prefs.setString('refreshToken', data['data']['refreshToken']);
    
    // Clear temp tokens
    await prefs.remove('tempAccessToken');
    await prefs.remove('tempRefreshToken');
    
    print('User verified successfully');
    
    return data;
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['error']);
  }
}
```

---

## Testing

### Test Mode Configuration

In `api/.env`:
```env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
```

### Test Script

Run the automated test:
```bash
./test-auto-otp-flow.sh
```

### Manual Testing with cURL

```bash
# 1. Register user (OTP sent automatically)
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "full_name": "John Doe"
  }'

# Check server logs for OTP (Test mode: 123456)

# 2. Verify OTP
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

## Benefits

### 1. Simplified Flow
- ✅ One less API call
- ✅ Faster registration
- ✅ Better user experience

### 2. Automatic OTP Delivery
- ✅ OTP sent immediately after registration
- ✅ No manual trigger needed
- ✅ Consistent behavior

### 3. Clear Response
- ✅ `otp_sent: true` confirms OTP was sent
- ✅ `otp_expires_in_minutes` shows expiry time
- ✅ Clear note for user guidance

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| message | string | Success message |
| data.user | object | User details |
| data.accessToken | string | JWT access token |
| data.refreshToken | string | JWT refresh token |
| data.otp_sent | boolean | Confirms OTP was sent |
| data.otp_expires_in_minutes | number | OTP expiry time (10 minutes) |
| data.note | string | Guidance message for user |

---

## Error Handling

### Duplicate Mobile Number
```json
{
  "error": "User already exists with this mobile number"
}
```

**Solution:** User should login instead of registering

### Missing Required Fields
```json
{
  "error": "Mobile number and full name are required"
}
```

**Solution:** Provide both mobile_number and full_name

### OTP Sending Failed
If OTP sending fails, the user is still created but `otp_sent` will be false.

**Solution:** Call `/auth/send-otp` manually to resend

---

## Production Checklist

### Before Going Live:

1. **Disable Test Mode**
   ```env
   OTP_TEST_MODE=false
   ```

2. **Configure Twilio**
   ```env
   TWILIO_ACCOUNT_SID=your_real_sid
   TWILIO_AUTH_TOKEN=your_real_token
   TWILIO_PHONE_NUMBER=your_real_number
   ```

3. **Test with Real SMS**
   - Register with real mobile number
   - Verify OTP is received via SMS
   - Confirm OTP verification works

4. **Monitor Logs**
   - Check for OTP sending failures
   - Monitor failed verification attempts
   - Track registration success rate

---

## Swagger Documentation

Access complete API documentation:
**https://abbey-stateliest-treva.ngrok-free.dev/api-docs/**

Look for:
- POST `/auth/mobile-register` - Now includes automatic OTP sending
- POST `/auth/verify-otp` - Verify the OTP received

---

## FAQ

### Q: What if OTP sending fails?
**A:** The user is still created. You can call `/auth/send-otp` manually to resend.

### Q: Can I still use `/auth/send-otp` separately?
**A:** Yes, it's still available for resending OTP or other purposes.

### Q: What's the default OTP in test mode?
**A:** Always `123456` when `OTP_TEST_MODE=true`

### Q: How long is the OTP valid?
**A:** 10 minutes (configurable via `OTP_EXPIRE_MINUTES`)

### Q: Can I change the OTP length?
**A:** Yes, set `OTP_LENGTH` in `.env` (default: 6)

---

## Related Documentation

- `MOBILE_REGISTRATION_API.md` - Full mobile registration guide
- `OTP_TESTING_GUIDE.md` - Complete OTP testing guide
- `OTP_QUICK_REFERENCE.md` - Quick reference card
- `MOBILE_APP_COMPLETE_GUIDE.md` - Mobile app integration guide

---

**Status:** Production Ready ✓

**Last Updated:** February 24, 2026

**Default Test OTP:** `123456`
