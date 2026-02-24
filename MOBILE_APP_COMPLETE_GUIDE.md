# Mobile App Complete Integration Guide

## Overview
Complete guide for integrating mobile registration and OTP verification in your mobile app.

---

## Quick Start

### 1. Configuration
The API is already configured with test mode enabled:

```env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

### 2. Default Test OTP
```
123456
```

### 3. Test Everything
```bash
./test-otp-flow.sh
```

---

## API Endpoints

### Base URL
```
http://localhost:8080/api/v1
```

### 1. Mobile Registration
**POST** `/auth/mobile-register`

**Request:**
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
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### 2. Send OTP
**POST** `/auth/send-otp`

**Request:**
```json
{
  "mobile_number": "+919876543210",
  "purpose": "mobile_verification"
}
```

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

**In Test Mode:** OTP is always `123456` (check server logs)

---

### 3. Verify OTP
**POST** `/auth/verify-otp`

**Request:**
```json
{
  "mobile_number": "+919876543210",
  "otp_code": "123456",
  "purpose": "mobile_verification"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile_verified": true,
      "is_verified": true
    },
    "accessToken": "new_jwt_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

## Mobile App Flow

### Registration Flow

```
1. User enters mobile number and name
   ↓
2. App calls /auth/mobile-register
   ↓
3. Store accessToken temporarily
   ↓
4. Navigate to OTP screen
   ↓
5. App calls /auth/send-otp
   ↓
6. User enters OTP (123456 in test mode)
   ↓
7. App calls /auth/verify-otp
   ↓
8. Store new accessToken & refreshToken
   ↓
9. Navigate to home screen
```

### Login Flow (Existing User)

```
1. User enters mobile number
   ↓
2. App calls /auth/send-otp (purpose: "login")
   ↓
3. User enters OTP (123456 in test mode)
   ↓
4. App calls /auth/verify-otp
   ↓
5. Store accessToken & refreshToken
   ↓
6. Navigate to home screen
```

---

## React Native Implementation

### Complete Example

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080/api/v1';

// Registration Screen
function RegistrationScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/auth/mobile-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobile,
          full_name: fullName,
          user_type: 'patient'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store temp token
        await AsyncStorage.setItem('tempToken', data.data.accessToken);
        
        // Navigate to OTP screen
        navigation.navigate('OTPVerification', { 
          mobile_number: mobile 
        });
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Mobile Number (+919876543210)"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Button 
        title="Register" 
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}

// OTP Verification Screen
function OTPVerificationScreen({ route, navigation }) {
  const { mobile_number } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Send OTP on mount
  React.useEffect(() => {
    sendOTP();
  }, []);

  const sendOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number,
          purpose: 'mobile_verification'
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP sent successfully');
        // In test mode, OTP is always 123456
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number,
          otp_code: otp,
          purpose: 'mobile_verification'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        await AsyncStorage.setItem('userId', data.data.user.id);
        
        // Navigate to home
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter OTP (123456 in test mode)"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button 
        title="Verify OTP" 
        onPress={verifyOTP}
        disabled={loading || otp.length !== 6}
      />
      <Button 
        title="Resend OTP" 
        onPress={sendOTP}
      />
    </View>
  );
}

export { RegistrationScreen, OTPVerificationScreen };
```

---

## Flutter Implementation

### Complete Example

```dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

const String API_URL = 'http://localhost:8080/api/v1';

// Registration Screen
class RegistrationScreen extends StatefulWidget {
  @override
  _RegistrationScreenState createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _mobileController = TextEditingController();
  final _nameController = TextEditingController();
  bool _loading = false;

  Future<void> _register() async {
    setState(() => _loading = true);

    try {
      final response = await http.post(
        Uri.parse('$API_URL/auth/mobile-register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'mobile_number': _mobileController.text,
          'full_name': _nameController.text,
          'user_type': 'patient',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // Store temp token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('tempToken', data['data']['accessToken']);

        // Navigate to OTP screen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OTPVerificationScreen(
              mobileNumber: _mobileController.text,
            ),
          ),
        );
      } else {
        _showError(data['error']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Register')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _mobileController,
              decoration: InputDecoration(
                labelText: 'Mobile Number',
                hintText: '+919876543210',
              ),
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: 16),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Full Name',
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _register,
              child: _loading
                  ? CircularProgressIndicator()
                  : Text('Register'),
            ),
          ],
        ),
      ),
    );
  }
}

// OTP Verification Screen
class OTPVerificationScreen extends StatefulWidget {
  final String mobileNumber;

  OTPVerificationScreen({required this.mobileNumber});

  @override
  _OTPVerificationScreenState createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final _otpController = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _sendOTP();
  }

  Future<void> _sendOTP() async {
    try {
      final response = await http.post(
        Uri.parse('$API_URL/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'mobile_number': widget.mobileNumber,
          'purpose': 'mobile_verification',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('OTP sent successfully')),
        );
        // In test mode, OTP is always 123456
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _verifyOTP() async {
    setState(() => _loading = true);

    try {
      final response = await http.post(
        Uri.parse('$API_URL/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'mobile_number': widget.mobileNumber,
          'otp_code': _otpController.text,
          'purpose': 'mobile_verification',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Store tokens
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('accessToken', data['data']['accessToken']);
        await prefs.setString('refreshToken', data['data']['refreshToken']);
        await prefs.setString('userId', data['data']['user']['id']);

        // Navigate to home
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        _showError(data['error']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Verify OTP')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Enter OTP sent to ${widget.mobileNumber}'),
            Text('(Test mode: use 123456)', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 16),
            TextField(
              controller: _otpController,
              decoration: InputDecoration(
                labelText: 'OTP',
                hintText: '123456',
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _verifyOTP,
              child: _loading
                  ? CircularProgressIndicator()
                  : Text('Verify OTP'),
            ),
            TextButton(
              onPressed: _sendOTP,
              child: Text('Resend OTP'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Testing Checklist

### ✅ Registration
- [ ] User can enter mobile number
- [ ] User can enter full name
- [ ] Name is split correctly (first/last)
- [ ] Tokens are returned
- [ ] User is created in database

### ✅ OTP Sending
- [ ] OTP is sent successfully
- [ ] OTP appears in server logs (test mode)
- [ ] Expiry time is shown
- [ ] Can resend OTP

### ✅ OTP Verification
- [ ] Correct OTP is accepted (123456)
- [ ] Wrong OTP is rejected
- [ ] Expired OTP is rejected
- [ ] Too many attempts are blocked
- [ ] User is marked as verified
- [ ] New tokens are returned

### ✅ Error Handling
- [ ] Network errors are handled
- [ ] Invalid mobile number is rejected
- [ ] Duplicate registration is prevented
- [ ] Clear error messages shown

---

## Production Checklist

Before going to production:

### 1. Disable Test Mode
```env
OTP_TEST_MODE=false
```

### 2. Configure Twilio
```env
TWILIO_ACCOUNT_SID=your_real_sid
TWILIO_AUTH_TOKEN=your_real_token
TWILIO_PHONE_NUMBER=your_real_number
```

### 3. Security
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting
- [ ] Add CAPTCHA for registration
- [ ] Monitor failed OTP attempts
- [ ] Log security events

### 4. User Experience
- [ ] Auto-read SMS (Android)
- [ ] Show countdown timer
- [ ] Allow resend after 30 seconds
- [ ] Clear error messages
- [ ] Loading indicators

---

## Support

### Documentation
- Full Guide: `MOBILE_REGISTRATION_API.md`
- OTP Guide: `OTP_TESTING_GUIDE.md`
- Quick Reference: `OTP_QUICK_REFERENCE.md`

### Test Scripts
- `./test-mobile-register-api.sh` - Test registration
- `./test-otp-flow.sh` - Test complete OTP flow

### Swagger
http://localhost:8080/api-docs/

---

**Status:** Ready for Mobile App Integration ✓

**Last Updated:** February 24, 2026
