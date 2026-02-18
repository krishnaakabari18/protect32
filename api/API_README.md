# Dentist Management System API

Complete REST API for dental clinic management with authentication, appointments, payments, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+

### Installation

```bash
# Install dependencies
npm install

# Configure environment
# Edit .env file with your database credentials

# Create database tables
npm run db:create

# Seed dummy data
npm run db:seed

# Start server
npm run dev
```

## 🔗 Access Points

### Production
- **API Base**: https://abbey-stateliest-treva.ngrok-free.dev/api/v1
- **Swagger Docs**: https://abbey-stateliest-treva.ngrok-free.dev/api-docs

### Local Development
- **API Base**: http://localhost:8080/api/v1
- **Swagger Docs**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

## 🔑 Test Credentials

All passwords: `password123`

- **Admin**: admin@dentist.com
- **Provider 1**: dr.smith@dentist.com
- **Provider 2**: dr.jones@dentist.com
- **Patient 1**: patient1@example.com
- **Patient 2**: patient2@example.com

## 📋 API Modules

### Authentication (12 endpoints)
- Email/Password login & registration
- Mobile OTP authentication
- Social login (Google, Facebook, Apple)
- Token management (refresh, logout)
- Profile & password management

### Core Modules
1. **Users** - User management
2. **Providers** - Dentist/provider management
3. **Patients** - Patient management with family members
4. **Appointments** - Appointment scheduling
5. **Plans** - Subscription plans
6. **Payments** - Payment processing
7. **Prescriptions** - Prescription management
8. **Documents** - Document management
9. **Notifications** - Notification system
10. **Reviews** - Provider reviews
11. **Treatment Plans** - Treatment planning
12. **Chat** - Messaging system

### Additional APIs
- Provider Schedules & Fees
- Operatories
- Patient Plans
- Appointment Forms
- Treatment Plan Items
- Post Treatment Records
- Settlements
- Network Providers
- Referrals
- Admin Forms
- App Versions

## 🔐 Authentication

### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "patient"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### OTP Login
```bash
# Send OTP
POST /api/v1/auth/send-otp
{
  "mobile_number": "+1234567890",
  "purpose": "login"
}

# Verify OTP
POST /api/v1/auth/verify-otp
{
  "mobile_number": "+1234567890",
  "otp_code": "123456",
  "purpose": "login"
}
```

### Protected Endpoints
Include JWT token in header:
```
Authorization: Bearer <your_access_token>
```

## 📊 Database

### Tables (28 total)
- users, providers, patients
- appointments, plans, payments
- prescriptions, documents, notifications
- reviews, treatment_plans, chat_messages
- and 16 more...

### Management Scripts
```bash
# Create tables
npm run db:create

# Seed data
npm run db:seed

# Clear all data
node database/clear-data.js

# Full reset
node database/clear-data.js && npm run db:seed
```

## 🎯 API Versioning

All endpoints use version prefix:
- **v1**: `/api/v1/...` (current)
- **v2**: `/api/v2/...` (future)

## 📚 Documentation

- **Swagger UI**: Interactive API documentation at `/api-docs`
- **DEPLOYMENT_COMPLETE.md**: Complete deployment guide
- **COMPLETE_API_DOCUMENTATION.md**: Full API reference

## 🔧 Configuration

Edit `.env` file:
```env
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=dentist
DB_PASS=dentist@345

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h

# OTP (optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
FACEBOOK_APP_ID=your_app_id
```

## 🧪 Testing

### Via Swagger UI
1. Visit http://localhost:8080/api-docs
2. Click "Authorize" and enter JWT token
3. Try any endpoint

### Via cURL
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@example.com","password":"password123"}'

# Get providers
curl http://localhost:8080/api/v1/providers

# Get appointments (authenticated)
curl http://localhost:8080/api/v1/appointments \
  -H "Authorization: Bearer <token>"
```

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Security**: bcryptjs, CORS

## 🎨 Project Structure

```
protect32/
├── database/
│   ├── schema.sql          # Database schema
│   ├── seed-data.js        # Seed script
│   └── clear-data.js       # Clear script
├── src/
│   ├── config/             # Configuration
│   ├── controllers/        # Business logic
│   ├── models/             # Database models
│   ├── routes/v1/          # API routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Utilities
│   ├── app.js              # Express app
│   └── server.js           # Entry point
├── .env                    # Environment config
└── package.json            # Dependencies
```

## 📊 Statistics

- **Total Endpoints**: 100+
- **API Modules**: 13+
- **Database Tables**: 28
- **Authentication Methods**: 5
- **Dummy Records**: 80+

## 🚀 Deployment

### Local
```bash
npm start
```

### Production
1. Set production environment variables
2. Configure database
3. Run migrations: `npm run db:create`
4. Start server: `npm start`

### With Ngrok
```bash
ngrok http 8080
```

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Token refresh mechanism
- Role-based access control
- OTP verification
- Social login integration

## 📝 License

ISC

## 👥 Support

For issues or questions, contact: support@dentist.com

---

**Visit Swagger Documentation**: http://localhost:8080/api-docs
