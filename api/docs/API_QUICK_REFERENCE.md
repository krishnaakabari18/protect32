# API Quick Reference Card

## 🔗 Base URLs
- **API v1**: `http://localhost:8080/api/v1`
- **Swagger**: `http://localhost:8080/api-docs`

## 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with email/password |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/send-otp` | Send OTP to mobile |
| POST | `/auth/verify-otp` | Verify OTP and login |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/facebook` | Facebook OAuth login |
| POST | `/auth/apple` | Apple OAuth login |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | Logout current device |
| POST | `/auth/logout-all` | Logout all devices |
| GET | `/auth/profile` | Get current user profile |
| POST | `/auth/change-password` | Change password |

## 📋 Main API Modules

### Users
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/users` | No |
| GET | `/users` | No |
| GET | `/users/:id` | No |
| PUT | `/users/:id` | No |
| DELETE | `/users/:id` | No |

### Providers
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/providers` | No |
| GET | `/providers` | No |
| GET | `/providers/:id` | No |
| PUT | `/providers/:id` | No |
| DELETE | `/providers/:id` | No |

### Patients
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/patients` | Yes |
| GET | `/patients` | Yes |
| GET | `/patients/:id` | Yes |
| PUT | `/patients/:id` | Yes |
| POST | `/patients/:id/family-members` | Yes |
| GET | `/patients/:id/family-members` | Yes |

### Appointments
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/appointments` | No |
| GET | `/appointments` | No |
| GET | `/appointments/:id` | No |
| PUT | `/appointments/:id` | No |
| DELETE | `/appointments/:id` | No |

### Plans
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/plans` | No |
| GET | `/plans` | No |
| GET | `/plans/:id` | No |
| PUT | `/plans/:id` | No |
| DELETE | `/plans/:id` | No |

### Payments
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/payments` | Yes |
| GET | `/payments` | Yes |
| GET | `/payments/:id` | Yes |
| PUT | `/payments/:id` | Yes |

### Prescriptions
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/prescriptions` | Yes |
| GET | `/prescriptions` | Yes |
| GET | `/prescriptions/:id` | Yes |
| PUT | `/prescriptions/:id` | Yes |
| DELETE | `/prescriptions/:id` | Yes |

### Documents
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/documents` | Yes |
| GET | `/documents` | Yes |
| GET | `/documents/:id` | Yes |
| PUT | `/documents/:id` | Yes |
| DELETE | `/documents/:id` | Yes |

### Notifications
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/notifications` | Yes |
| GET | `/notifications` | Yes |
| GET | `/notifications/:id` | Yes |
| PUT | `/notifications/:id` | Yes |
| DELETE | `/notifications/:id` | Yes |

### Reviews
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/reviews` | Yes |
| GET | `/reviews` | Yes |
| GET | `/reviews/:id` | Yes |
| PUT | `/reviews/:id` | Yes |
| DELETE | `/reviews/:id` | Yes |

### Treatment Plans
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/treatment-plans` | Yes |
| GET | `/treatment-plans` | Yes |
| GET | `/treatment-plans/:id` | Yes |
| PUT | `/treatment-plans/:id` | Yes |
| DELETE | `/treatment-plans/:id` | Yes |

### Chat
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/chats` | Yes |
| GET | `/chats` | Yes |
| GET | `/chats/:id` | Yes |
| PUT | `/chats/:id` | Yes |
| DELETE | `/chats/:id` | Yes |

## 🔑 Authentication Header

For protected endpoints, include:
```
Authorization: Bearer <your_access_token>
```

## 📊 Common Query Parameters

### Users
- `user_type`: patient, provider, admin
- `is_active`: true, false

### Providers
- `specialty`: Orthodontics, Endodontics, etc.
- `location`: City or address

### Appointments
- `patient_id`: UUID
- `provider_id`: UUID
- `status`: Upcoming, Completed, Cancelled, No-Show
- `date`: YYYY-MM-DD

### Payments
- `patient_id`: UUID
- `provider_id`: UUID
- `status`: Paid, Pending, Failed, Refunded

### Plans
- `is_active`: true, false

## 📝 Sample Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Send OTP
```bash
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+1234567890",
    "purpose": "login"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

## 🎯 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## 📚 Full Documentation

For complete documentation with examples, visit:
- **Swagger UI**: http://localhost:8080/api-docs
- **Complete Guide**: COMPLETE_API_DOCUMENTATION.md
- **Summary**: FINAL_SUMMARY.md
