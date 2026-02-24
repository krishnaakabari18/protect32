# Dentist Management System - API

RESTful API backend for the Dentist Management System.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Setup database
createdb dentist_newdb
psql -U dentist -d dentist_newdb -f database/create-tables.sql

# Start server
npm start
```

### Access
- **API:** http://localhost:8080
- **Swagger:** http://localhost:8080/api-docs/
- **Health Check:** http://localhost:8080/health

---

## 📚 Documentation

Complete API documentation is available in the [docs](docs/) folder.

### Essential Guides
- [📖 Documentation Index](docs/INDEX.md)
- [📋 Complete API Documentation](docs/COMPLETE_API_DOCUMENTATION.md)
- [⚡ Quick Reference](docs/API_QUICK_REFERENCE.md)
- [🧪 Testing Guide](docs/API_TESTING_GUIDE.md)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api/v1
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/mobile-register` - Mobile registration (auto OTP)
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/refresh-token` - Refresh token

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Providers
- `GET /providers` - Get all providers
- `POST /providers` - Create provider
- `PUT /providers/:id` - Update provider

#### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment

#### Documents
- `GET /documents` - Get all documents
- `POST /documents` - Upload document

#### Patient Education
- `GET /patient-education` - Get all content
- `POST /patient-education` - Create content
- `PUT /patient-education/:id` - Update content

#### Reviews
- `GET /reviews` - Get all reviews
- `POST /reviews` - Create review

#### Support Tickets
- `GET /support-tickets` - Get all tickets
- `POST /support-tickets` - Create ticket

---

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **OTP:** Twilio (optional)
- **Documentation:** Swagger/OpenAPI
- **Validation:** Express Validator

---

## 📁 Project Structure

```
api/
├── src/
│   ├── controllers/      # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   │   └── v1/          # Version 1 routes
│   ├── middleware/       # Middleware (auth, validation)
│   ├── utils/            # Utilities (JWT, OTP, upload)
│   ├── config/           # Configuration (database, swagger)
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── database/            # SQL migration scripts
├── uploads/             # File uploads directory
├── docs/                # API documentation
├── .env                 # Environment variables
├── package.json         # Dependencies
└── README.md           # This file
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=dentist
DB_PASS=dentist@345

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# OTP
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

---

## 🔐 Authentication

### JWT Tokens

**Access Token:**
- Expiry: 7 days (configurable)
- Usage: API requests
- Header: `Authorization: Bearer <token>`

**Refresh Token:**
- Expiry: 30 days (configurable)
- Usage: Get new access token
- Endpoint: `POST /auth/refresh-token`

### Example

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@dentist.com","password":"password123"}'

# Use token
curl -X GET http://localhost:8080/api/v1/users \
  -H 'Authorization: Bearer <your_token>'
```

---

## 📱 Mobile API

### Registration with Auto OTP

```bash
# Register (OTP sent automatically)
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "full_name": "John Doe"
  }'

# Verify OTP (Test mode: 123456)
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

## 🧪 Testing

### Test Scripts

```bash
# Test mobile registration
../test-mobile-register-api.sh

# Test OTP flow
../test-otp-flow.sh

# Test auto OTP
../test-auto-otp-flow.sh
```

### Test Mode

```env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

**Default Test OTP:** `123456`

---

## 📖 Swagger Documentation

### Access Swagger UI
```
http://localhost:8080/api-docs/
```

### Features
- Interactive API testing
- Request/Response schemas
- Authentication support
- Example values
- Try it out functionality

---

## 🗄️ Database

### Connection

```javascript
const pool = require('./src/config/database');

// Query example
const result = await pool.query('SELECT * FROM users');
```

### Migrations

```bash
# Run all migrations
psql -U dentist -d dentist_newdb -f database/create-tables.sql

# Run specific migration
psql -U dentist -d dentist_newdb -f database/create-appointments-table.sql
```

### Main Tables
- `users` - User accounts
- `providers` - Healthcare providers
- `appointments` - Appointments
- `documents` - Documents
- `patient_education_content` - Educational content
- `reviews` - Reviews
- `support_tickets` - Support tickets
- `otps` - OTP codes
- `refresh_tokens` - JWT refresh tokens

---

## 📦 File Uploads

### Configuration

```javascript
// Multer setup
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Validate file type
  }
});
```

### Upload Endpoints
- `POST /users/:id/profile-picture` - Profile picture
- `POST /documents` - Documents
- `POST /patient-education` - Feature image
- `POST /education-images/upload` - Inline images

### Storage Structure
```
uploads/
├── users/           # Profile pictures
├── documents/       # Documents
└── education/       # Educational content images
    └── YYYY/MM/DD/  # Date-based folders
```

---

## 🚀 Deployment

### Production Checklist

1. **Environment:**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secret
   - Disable test mode: `OTP_TEST_MODE=false`

2. **Database:**
   - Run migrations
   - Create indexes
   - Set up backups

3. **Security:**
   - Enable HTTPS
   - Configure CORS
   - Set up rate limiting
   - Enable logging

4. **OTP:**
   - Configure Twilio credentials
   - Test SMS delivery

### Start Production

```bash
# Using PM2
pm2 start src/server.js --name dentist-api

# Using systemd
sudo systemctl start dentist-api
```

---

## 🔧 Development

### Start Development Server

```bash
npm run dev
```

### Watch Mode

```bash
npm run watch
```

### Linting

```bash
npm run lint
```

---

## 📊 API Statistics

- **Total Endpoints:** 100+
- **API Version:** v1
- **Authentication:** JWT
- **File Upload:** Multer
- **Documentation:** Swagger/OpenAPI
- **Database:** PostgreSQL

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8080
pkill -f "node src/server.js"
```

### Database Connection Failed

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -U dentist -d dentist_newdb -c "SELECT 1"
```

### OTP Not Working

1. Check `OTP_TEST_MODE=true` in .env
2. Check server logs for OTP code
3. Use default OTP: `123456`

---

## 📝 Scripts

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest",
  "lint": "eslint src/"
}
```

---

## 🔗 Related Documentation

- [Project README](../README.md)
- [Complete Documentation](../docs/README.md)
- [Mobile App Guide](../docs/MOBILE_APP_COMPLETE_GUIDE.md)
- [OTP Testing](../docs/OTP_TESTING_GUIDE.md)

---

## 📞 Support

- **Documentation:** [docs/INDEX.md](docs/INDEX.md)
- **Swagger:** http://localhost:8080/api-docs/
- **Issues:** GitHub Issues

---

## 📅 Version

**Version:** 1.0.0

**Last Updated:** February 24, 2026

**Status:** Production Ready ✓

---

**Made with ❤️ for dental clinics**
