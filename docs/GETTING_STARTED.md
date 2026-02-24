# Getting Started - Dentist Management System

Quick start guide to get up and running in minutes.

---

## ⚡ Quick Setup (5 Minutes)

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
psql --version  # Should be 14+
```

### 2. Clone & Install
```bash
# API
cd api
npm install

# Frontend
cd ../backend
npm install
```

### 3. Database Setup
```bash
# Create database
createdb dentist_newdb

# Run migrations
cd api/database
psql -U dentist -d dentist_newdb -f create-tables.sql
```

### 4. Configure Environment
```bash
# API
cd api
cp .env.example .env
# Edit .env with your settings

# Frontend
cd ../backend
cp .env.example .env.local
# Edit .env.local with your settings
```

### 5. Start Services
```bash
# Terminal 1 - API
cd api
npm start

# Terminal 2 - Frontend
cd backend
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:3000
- API: http://localhost:8080
- Swagger: http://localhost:8080/api-docs/

### 7. Login
- Email: `admin@dentist.com`
- Password: `password123`

---

## 📱 Mobile App Setup (Additional 5 Minutes)

### 1. Enable Test Mode
```env
# api/.env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

### 2. Test Registration
```bash
curl -X POST http://localhost:8080/api/v1/auth/mobile-register \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "full_name": "John Doe"
  }'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "mobile_number": "+1234567890",
    "otp_code": "123456",
    "purpose": "mobile_verification"
  }'
```

---

## 🎯 Next Steps

### Learn More
1. [Complete Documentation](README.md)
2. [API Documentation](API_CONFIGURATION_REFACTORING.md)
3. [Mobile Integration](MOBILE_APP_COMPLETE_GUIDE.md)

### Implement Features
1. [Appointments](APPOINTMENTS_MODULE_COMPLETE.md)
2. [Documents](DOCUMENTS_MODULE_COMPLETE.md)
3. [Patient Education](PATIENT_EDUCATION_MODULE_COMPLETE.md)

### Troubleshooting
1. [Login Issues](LOGIN_TROUBLESHOOTING.md)
2. [API Issues](API_SERVER_FIX.md)
3. [Database Issues](DATABASE_PASSWORD_FIX.md)

---

## 🔑 Important Information

### Default Credentials
- **Admin Email:** admin@dentist.com
- **Password:** password123
- **Test OTP:** 123456

### Ports
- **API:** 8080
- **Frontend:** 3000
- **Database:** 5432

### URLs
- **Local API:** http://localhost:8080/api/v1
- **Local Frontend:** http://localhost:3000
- **Swagger:** http://localhost:8080/api-docs/

---

## �� Common Issues

### Port Already in Use
```bash
# Kill process on port 8080
pkill -f "node src/server.js"

# Kill process on port 3000
pkill -f "next dev"
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in api/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=dentist
DB_PASS=dentist@345
```

### Cannot Login
1. Check API is running on port 8080
2. Verify database has users table
3. Check default credentials
4. See [LOGIN_TROUBLESHOOTING.md](LOGIN_TROUBLESHOOTING.md)

---

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Database created
- [ ] API dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] API running on port 8080
- [ ] Frontend running on port 3000
- [ ] Can access Swagger UI
- [ ] Can login to admin panel

---

## 📚 Documentation Structure

```
docs/
├── README.md                 # Complete documentation index
├── GETTING_STARTED.md        # This file
├── NAVIGATION.md             # Quick navigation guide
├── QUICK_REFERENCE.md        # Quick reference
└── [82 other documentation files]
```

---

**Ready to build? Start with the [Complete Documentation](README.md)!**

**Last Updated:** February 24, 2026
