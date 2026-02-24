# Mobile Registration API - Complete Documentation

## Overview
New API endpoint for mobile app registration that accepts mobile number and full name. The full name is automatically split into first_name and last_name.

---

## API Endpoint

**POST** `/api/v1/auth/mobile-register`

**Purpose:** Register new users from mobile app using mobile number and full name only.

---

## Request

### Headers
```
Content-Type: application/json
```

### Request Body

**Required Fields:**
- `mobile_number` (string) - Mobile number with country code (e.g., "+919876543210")
- `full_name` (string) - Full name that will be split into first and last name

**Optional Fields:**
- `user_type` (string) - User type: "patient", "provider", or "admin" (default: "patient")

### Example Requests

#### 1. Register with First and Last Name
```json
{
  "mobile_number": "+919876543210",
  "full_name": "John Doe",
  "user_type": "patient"
}
```

#### 2. Register with Single Name (First Name Only)
```json
{
  "mobile_number": "+919876543211",
  "full_name": "Rajesh"
}
```

#### 3. Register with Multiple Names
```json
{
  "mobile_number": "+919876543212",
  "full_name": "Amit Kumar Singh"
}
```

---

## Name Splitting Logic

The API automatically splits the `full_name` into `first_name` and `last_name`:

| Input Full Name | First Name | Last Name |
|----------------|------------|-----------|
| "John" | "John" | null |
| "John Doe" | "John" | "Doe" |
| "Amit Kumar Singh" | "Amit" | "Kumar Singh" |
| "Dr. Rajesh Kumar" | "Dr." | "Rajesh Kumar" |

**Logic:**
- First word → `first_name` (required)
- Remaining words → `last_name` (optional, can be null)
- Multiple spaces are handled correctly
- Leading/trailing spaces are trimmed

---

## Response

### Success Response (201 Created)

```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "fc23533d-5be7-4079-8f4d-1018d286bd8a",
      "email": null,
      "mobile_number": "+919876543210",
      "mobile_verified": false,
      "google_id": null,
      "facebook_id": null,
      "apple_id": null,
      "is_online": false,
      "last_seen": null,
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": null,
      "date_of_birth": null,
      "address": null,
      "user_type": "patient",
      "is_active": true,
      "is_verified": false,
      "created_at": "2026-02-24T08:59:53.646Z",
      "updated_at": "2026-02-24T08:59:53.646Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "note": "Please verify your mobile number using OTP"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "error": "Mobile number and full name are required"
}
```

#### 400 Bad Request - User Already Exists
```json
{
  "error": "User already exists with this mobile number"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Database connection failed"
}
```

---

## User Object Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique user identifier |
| mobile_number | String | Mobile number with country code |
| first_name | String | First name (extracted from full_name) |
| last_name | String/null | Last name (extracted from full_name, can be null) |
| email | String/null | Email (null for mobile registration) |
| user_type | String | "patient", "provider", or "admin" |
| mobile_verified | Boolean | false (needs OTP verification) |
| is_verified | Boolean | false (needs verification) |
| is_active | Boolean | true (account is active) |
| is_online | Boolean | false (user is offline) |
| profile_picture | String/null | Profile picture URL (null initially) |
| date_of_birth | Date/null | Date of birth (null initially) |
| address | String/null | Address (null initially) |
| created_at | Timestamp | Account creation time |
| updated_at | Timestamp | Last update time |

---

## Authentication Tokens

### Access Token
- **Type:** JWT (JSON Web Token)
- **Expiry:** 7 days (configurable in .env)
- **Usage:** Include in Authorization header for API requests
- **Format:** `Authorization: Bearer <accessToken>`

### Refresh Token
- **Type:** JWT (JSON Web Token)
- **Expiry:** 30 days (configurable in .env)
- **Usage:** Use to get new access token when it expires
- **Endpoint:** POST `/api/v1/auth/refresh-token`

---

## Post-Registration Flow

After successful registration, the mobile app should:

### 1. Send OTP for Mobile Verification
**POST** `/api/v1/auth/send-otp`

```json
{
  "mobile_number": "+919876543210",
  "purpose": "mobile_verification"
}
```

### 2. Verify OTP
**POST** `/api/v1/auth/verify-otp`

```json
{
  "mobile_number": "+919876543210",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

### 3. Use Access Token
Include the access token in all subsequent API requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Mobile App Integration Example

### React Native / JavaScript

```javascript
// Mobile Registration Function
async function registerUser(mobileNumber, fullName) {
  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/mobile-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_number: mobileNumber,
        full_name: fullName,
        user_type: 'patient'
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store tokens securely
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('userId', data.data.user.id);
      
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        mobile_number: mobileNumber
      });
      
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Usage
registerUser('+919876543210', 'John Doe')
  .then(result => console.log('Registration successful:', result))
  .catch(error => console.error('Registration failed:', error));
```

### Flutter / Dart

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> registerUser(String mobileNumber, String fullName) async {
  final url = Uri.parse('http://localhost:8080/api/v1/auth/mobile-register');
  
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'mobile_number': mobileNumber,
      'full_name': fullName,
      'user_type': 'patient',
    }),
  );

  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    
    // Store tokens securely
    await storage.write(key: 'accessToken', value: data['data']['accessToken']);
    await storage.write(key: 'refreshToken', value: data['data']['refreshToken']);
    await storage.write(key: 'userId', value: data['data']['user']['id']);
    
    return data;
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['error']);
  }
}

// Usage
try {
  final result = await registerUser('+919876543210', 'John Doe');
  print('Registration successful: $result');
} catch (e) {
  print('Registration failed: $e');
}
```

---

## Validation Rules

### Mobile Number
- **Required:** Yes
- **Format:** Must include country code (e.g., +91, +1)
- **Unique:** Must not already exist in database
- **Example:** "+919876543210", "+12025551234"

### Full Name
- **Required:** Yes
- **Min Length:** 1 character (at least first name)
- **Max Length:** 255 characters
- **Format:** Any text, will be split on spaces
- **Trimming:** Leading/trailing spaces removed automatically

### User Type
- **Required:** No
- **Default:** "patient"
- **Valid Values:** "patient", "provider", "admin"

---

## Security Features

1. **No Password Required:** Mobile-only registration doesn't require password initially
2. **JWT Tokens:** Secure authentication using JWT
3. **Refresh Tokens:** Long-lived tokens stored securely
4. **Mobile Verification:** Users must verify mobile via OTP
5. **Device Tracking:** Device info stored with refresh tokens
6. **IP Tracking:** IP address logged for security

---

## Database Schema

The user is created in the `users` table with these fields:

```sql
INSERT INTO users (
  mobile_number,
  first_name,
  last_name,
  user_type,
  mobile_verified,
  is_verified,
  email,
  password_hash
) VALUES (
  '+919876543210',
  'John',
  'Doe',
  'patient',
  false,
  false,
  null,
  null
);
```

---

## Testing

### Using cURL

```bash
# Test 1: Register with full name
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543210",
    "full_name": "John Doe",
    "user_type": "patient"
  }'

# Test 2: Register with single name
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543211",
    "full_name": "Rajesh"
  }'

# Test 3: Register with multiple names
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+919876543212",
    "full_name": "Amit Kumar Singh"
  }'
```

### Using Test Script

Run the provided test script:
```bash
./test-mobile-register-api.sh
```

### Using Swagger UI

1. Open: http://localhost:8080/api-docs/
2. Find "Authentication" section
3. Locate "POST /auth/mobile-register"
4. Click "Try it out"
5. Enter test data
6. Click "Execute"

---

## Comparison with Existing Registration

| Feature | Email Registration | Mobile Registration |
|---------|-------------------|---------------------|
| Endpoint | `/auth/register` | `/auth/mobile-register` |
| Required Fields | email, password, first_name, last_name | mobile_number, full_name |
| Name Input | Separate fields | Single field (auto-split) |
| Password | Required | Not required |
| Email | Required | Not required (null) |
| Verification | Email verification | OTP verification |
| Use Case | Web application | Mobile application |

---

## Error Handling

### Client-Side Validation

Before calling the API, validate:

```javascript
function validateMobileRegistration(mobileNumber, fullName) {
  const errors = [];
  
  // Validate mobile number
  if (!mobileNumber || mobileNumber.trim() === '') {
    errors.push('Mobile number is required');
  } else if (!/^\+\d{10,15}$/.test(mobileNumber)) {
    errors.push('Mobile number must include country code (e.g., +919876543210)');
  }
  
  // Validate full name
  if (!fullName || fullName.trim() === '') {
    errors.push('Full name is required');
  } else if (fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }
  
  return errors;
}
```

### Server-Side Error Handling

The API handles these error cases:
- Missing required fields → 400 Bad Request
- Duplicate mobile number → 400 Bad Request
- Database errors → 500 Internal Server Error
- Invalid data format → 400 Bad Request

---

## Best Practices

### For Mobile App Developers

1. **Store Tokens Securely**
   - Use secure storage (Keychain/Keystore)
   - Never store in plain text
   - Clear on logout

2. **Handle Token Expiry**
   - Implement automatic token refresh
   - Handle 401 errors gracefully
   - Redirect to login when needed

3. **Validate Input**
   - Validate before API call
   - Show clear error messages
   - Format mobile number correctly

4. **User Experience**
   - Show loading indicators
   - Handle network errors
   - Provide clear feedback

5. **OTP Verification**
   - Prompt for OTP immediately after registration
   - Allow resend OTP option
   - Show countdown timer

---

## API Versioning

Current version: **v1**

Base URL: `http://localhost:8080/api/v1`

All endpoints are versioned to ensure backward compatibility.

---

## Support

### Swagger Documentation
http://localhost:8080/api-docs/

### Related Endpoints
- POST `/api/v1/auth/send-otp` - Send OTP
- POST `/api/v1/auth/verify-otp` - Verify OTP
- POST `/api/v1/auth/refresh-token` - Refresh access token
- POST `/api/v1/auth/logout` - Logout
- GET `/api/v1/auth/profile` - Get user profile

---

## Changelog

### Version 1.0.0 (February 24, 2026)
- ✅ Initial release
- ✅ Mobile registration with full name splitting
- ✅ JWT authentication
- ✅ Swagger documentation
- ✅ Test script included
- ✅ Mobile app integration examples

---

**Status:** Production Ready ✓

**Last Updated:** February 24, 2026
