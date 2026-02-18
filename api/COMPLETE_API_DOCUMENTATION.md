# Complete API Documentation - Dentist Management System

## 🚀 Server Information
- **Base URL**: http://localhost:8080
- **API Version**: v1
- **Swagger Documentation**: http://localhost:8080/api-docs

## 📋 API Versioning

All APIs support versioning. You can access them in two ways:

1. **Versioned** (Recommended): `/api/v1/...`
2. **Default** (backward compatible): `/api/...`

Future versions will be available at `/api/v2/...`, `/api/v3/...`, etc.

## 🔐 Authentication APIs

### 1. Register with Email/Password
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "mobile_number": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "patient",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St"
}
```

### 2. Login with Email/Password
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Send OTP to Mobile
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "mobile_number": "+1234567890",
  "purpose": "login"
}
```
**Purpose options**: `registration`, `login`, `password_reset`, `mobile_verification`

### 4. Verify OTP and Login/Register
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "mobile_number": "+1234567890",
  "otp_code": "123456",
  "purpose": "login",
  "user_data": {
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "patient",
    "password": "optional_password"
  }
}
```

### 5. Google Login
```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "google_id": "google_user_id",
  "email": "user@gmail.com",
  "first_name": "John",
  "last_name": "Doe",
  "picture": "https://..."
}
```

### 6. Facebook Login
```http
POST /api/v1/auth/facebook
Content-Type: application/json

{
  "facebook_id": "facebook_user_id",
  "email": "user@facebook.com",
  "first_name": "John",
  "last_name": "Doe",
  "picture": "https://..."
}
```

### 7. Apple Login
```http
POST /api/v1/auth/apple
Content-Type: application/json

{
  "apple_id": "apple_user_id",
  "email": "user@icloud.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 8. Refresh Access Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### 9. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### 10. Logout from All Devices
```http
POST /api/v1/auth/logout-all
Authorization: Bearer <access_token>
```

### 11. Get Current User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

### 12. Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "old_password",
  "new_password": "new_password"
}
```

## 👥 User Management APIs

### Create User
```http
POST /api/v1/users
```

### Get All Users
```http
GET /api/v1/users?user_type=patient&is_active=true
```

### Get User by ID
```http
GET /api/v1/users/{id}
```

### Update User
```http
PUT /api/v1/users/{id}
```

### Delete User
```http
DELETE /api/v1/users/{id}
```

## 🏥 Provider APIs

### Create Provider
```http
POST /api/v1/providers
```

### Get All Providers
```http
GET /api/v1/providers?specialty=Orthodontics&location=New York
```

### Get Provider by ID
```http
GET /api/v1/providers/{id}
```

### Update Provider
```http
PUT /api/v1/providers/{id}
```

### Delete Provider
```http
DELETE /api/v1/providers/{id}
```

## 🏥 Patient APIs

### Create Patient
```http
POST /api/v1/patients
Authorization: Bearer <access_token>
```

### Get All Patients
```http
GET /api/v1/patients
Authorization: Bearer <access_token>
```

### Get Patient by ID
```http
GET /api/v1/patients/{id}
Authorization: Bearer <access_token>
```

### Update Patient
```http
PUT /api/v1/patients/{id}
Authorization: Bearer <access_token>
```

### Add Family Member
```http
POST /api/v1/patients/{id}/family-members
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Doe",
  "relationship": "Spouse",
  "mobile_number": "+1234567890",
  "date_of_birth": "1992-05-15"
}
```

### Get Family Members
```http
GET /api/v1/patients/{id}/family-members
Authorization: Bearer <access_token>
```

## 📅 Appointment APIs

### Create Appointment
```http
POST /api/v1/appointments
```

### Get All Appointments
```http
GET /api/v1/appointments?patient_id={id}&provider_id={id}&status=Upcoming&date=2026-03-01
```

### Get Appointment by ID
```http
GET /api/v1/appointments/{id}
```

### Update Appointment
```http
PUT /api/v1/appointments/{id}
```

### Delete Appointment
```http
DELETE /api/v1/appointments/{id}
```

## 💳 Plan APIs

### Create Plan
```http
POST /api/v1/plans
```

### Get All Plans
```http
GET /api/v1/plans?is_active=true
```

### Get Plan by ID
```http
GET /api/v1/plans/{id}
```

### Update Plan
```http
PUT /api/v1/plans/{id}
```

### Delete Plan
```http
DELETE /api/v1/plans/{id}
```

## 💰 Payment APIs

### Create Payment
```http
POST /api/v1/payments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "patient_id": "uuid",
  "provider_id": "uuid",
  "appointment_id": "uuid",
  "amount": 150.00,
  "payment_method": "credit_card",
  "transaction_id": "txn_123456"
}
```

### Get All Payments
```http
GET /api/v1/payments?patient_id={id}&provider_id={id}&status=Paid
Authorization: Bearer <access_token>
```

### Get Payment by ID
```http
GET /api/v1/payments/{id}
Authorization: Bearer <access_token>
```

### Update Payment
```http
PUT /api/v1/payments/{id}
Authorization: Bearer <access_token>
```

## 💊 Prescription APIs

### Create Prescription
```http
POST /api/v1/prescriptions
Authorization: Bearer <access_token>
```

### Get All Prescriptions
```http
GET /api/v1/prescriptions?patient_id={id}&provider_id={id}
Authorization: Bearer <access_token>
```

### Get Prescription by ID
```http
GET /api/v1/prescriptions/{id}
Authorization: Bearer <access_token>
```

### Update Prescription
```http
PUT /api/v1/prescriptions/{id}
Authorization: Bearer <access_token>
```

### Delete Prescription
```http
DELETE /api/v1/prescriptions/{id}
Authorization: Bearer <access_token>
```

## 📄 Document APIs

### Upload Document
```http
POST /api/v1/documents
Authorization: Bearer <access_token>
```

### Get All Documents
```http
GET /api/v1/documents?patient_id={id}&document_type=X-Ray
Authorization: Bearer <access_token>
```

### Get Document by ID
```http
GET /api/v1/documents/{id}
Authorization: Bearer <access_token>
```

### Update Document
```http
PUT /api/v1/documents/{id}
Authorization: Bearer <access_token>
```

### Delete Document
```http
DELETE /api/v1/documents/{id}
Authorization: Bearer <access_token>
```

## 🔔 Notification APIs

### Create Notification
```http
POST /api/v1/notifications
Authorization: Bearer <access_token>
```

### Get All Notifications
```http
GET /api/v1/notifications?user_id={id}&is_read=false
Authorization: Bearer <access_token>
```

### Get Notification by ID
```http
GET /api/v1/notifications/{id}
Authorization: Bearer <access_token>
```

### Mark as Read
```http
PUT /api/v1/notifications/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_read": true
}
```

### Delete Notification
```http
DELETE /api/v1/notifications/{id}
Authorization: Bearer <access_token>
```

## ⭐ Review APIs

### Create Review
```http
POST /api/v1/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "provider_id": "uuid",
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Get All Reviews
```http
GET /api/v1/reviews?provider_id={id}
Authorization: Bearer <access_token>
```

### Get Review by ID
```http
GET /api/v1/reviews/{id}
Authorization: Bearer <access_token>
```

### Update Review
```http
PUT /api/v1/reviews/{id}
Authorization: Bearer <access_token>
```

### Delete Review
```http
DELETE /api/v1/reviews/{id}
Authorization: Bearer <access_token>
```

## 🦷 Treatment Plan APIs

### Create Treatment Plan
```http
POST /api/v1/treatment-plans
Authorization: Bearer <access_token>
```

### Get All Treatment Plans
```http
GET /api/v1/treatment-plans?patient_id={id}&status=Proposed
Authorization: Bearer <access_token>
```

### Get Treatment Plan by ID
```http
GET /api/v1/treatment-plans/{id}
Authorization: Bearer <access_token>
```

### Update Treatment Plan
```http
PUT /api/v1/treatment-plans/{id}
Authorization: Bearer <access_token>
```

### Delete Treatment Plan
```http
DELETE /api/v1/treatment-plans/{id}
Authorization: Bearer <access_token>
```

## 💬 Chat APIs

### Send Message
```http
POST /api/v1/chats
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "room_id": "uuid",
  "sender_id": "uuid",
  "message_type": "text",
  "content": "Hello, how are you?"
}
```

### Get All Messages
```http
GET /api/v1/chats?room_id={id}
Authorization: Bearer <access_token>
```

### Get Message by ID
```http
GET /api/v1/chats/{id}
Authorization: Bearer <access_token>
```

### Update Message
```http
PUT /api/v1/chats/{id}
Authorization: Bearer <access_token>
```

### Delete Message
```http
DELETE /api/v1/chats/{id}
Authorization: Bearer <access_token>
```

## 🔑 Authentication Flow Examples

### Example 1: Email/Password Registration & Login
```bash
# 1. Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "patient"
  }'

# Response includes: user, accessToken, refreshToken

# 2. Use the access token for authenticated requests
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer <accessToken>"
```

### Example 2: Mobile OTP Login
```bash
# 1. Send OTP
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+1234567890",
    "purpose": "login"
  }'

# 2. Verify OTP
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+1234567890",
    "otp_code": "123456",
    "purpose": "login"
  }'

# Response includes: user, accessToken, refreshToken
```

### Example 3: Social Login (Google)
```bash
curl -X POST http://localhost:8080/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "google_user_id_from_oauth",
    "email": "john@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "picture": "https://profile-pic-url"
  }'

# Response includes: user, accessToken, refreshToken
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

### Authentication Response
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "patient"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

## 🔒 Protected Routes

Most routes require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your_access_token>
```

## 📝 Notes

1. **OTP Development Mode**: In development, OTPs are logged to console instead of being sent via SMS
2. **Token Expiry**: Access tokens expire in 24 hours, refresh tokens in 7 days
3. **Social Login**: Requires proper OAuth configuration in `.env` file
4. **API Versioning**: Always use `/api/v1/` prefix for version 1 APIs

## 🎯 Next Steps

1. Configure Twilio for SMS OTP (update `.env`)
2. Configure email service for email OTP (update `.env`)
3. Set up OAuth apps for Google, Facebook, Apple
4. Implement file upload for documents
5. Add WebSocket for real-time chat
6. Implement pagination for list endpoints

## 📚 Additional Resources

- Swagger UI: http://localhost:8080/api-docs
- Database Schema: `database/schema.sql`
- Environment Config: `.env`
