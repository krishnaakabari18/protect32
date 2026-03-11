# API Documentation Index

Complete documentation for the Dentist Management System API.

---

## 📚 Quick Navigation

### Essential Guides

| Document | Description |
|----------|-------------|
| [README.md](README.md) | API overview and setup |
| [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) | Quick reference for API endpoints |
| [COMPLETE_API_DOCUMENTATION.md](COMPLETE_API_DOCUMENTATION.md) | Complete API documentation |

---

## 🚀 Getting Started

### Setup & Configuration

1. **Read First:** [README.md](README.md)
2. **Quick Reference:** [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
3. **Complete Guide:** [COMPLETE_API_DOCUMENTATION.md](COMPLETE_API_DOCUMENTATION.md)

### Testing

- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - Complete testing guide
- [SWAGGER_STATUS.md](SWAGGER_STATUS.md) - Swagger documentation status

---

## 📖 Documentation Files

### Core Documentation

| Document | Description | Priority |
|----------|-------------|----------|
| [README.md](README.md) | API overview | 🔴 Critical |
| [COMPLETE_API_DOCUMENTATION.md](COMPLETE_API_DOCUMENTATION.md) | Full API docs | 🔴 Critical |
| [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) | Quick reference | 🟡 Important |

### Testing & Deployment

| Document | Description | Priority |
|----------|-------------|----------|
| [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) | Testing guide | 🟡 Important |
| [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) | Deployment guide | 🟡 Important |
| [NGROK_USAGE_GUIDE.md](NGROK_USAGE_GUIDE.md) | Ngrok setup | 🟢 Optional |

### Features & Guides

| Document | Description | Priority |
|----------|-------------|----------|
| [FILE_UPLOAD_GUIDE.md](FILE_UPLOAD_GUIDE.md) | File upload implementation | 🟡 Important |
| [URL_CONVERSION_IMPLEMENTATION.md](URL_CONVERSION_IMPLEMENTATION.md) | URL conversion for images/documents | 🟡 Important |
| [SWAGGER_STATUS.md](SWAGGER_STATUS.md) | Swagger documentation | 🟡 Important |
| [LOGIN_FIX_SUMMARY.md](LOGIN_FIX_SUMMARY.md) | Login fixes | 🟢 Optional |

### Status & Summaries

| Document | Description | Priority |
|----------|-------------|----------|
| [FINAL_STATUS.md](FINAL_STATUS.md) | Final status | 🟢 Optional |
| [FINAL_FIX_SUMMARY.md](FINAL_FIX_SUMMARY.md) | Fix summary | 🟢 Optional |
| [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) | Cleanup summary | 🟢 Optional |

---

## 🎯 By Topic

### Authentication & Security
- [LOGIN_FIX_SUMMARY.md](LOGIN_FIX_SUMMARY.md)
- See main docs: `../docs/AUTH_IMPLEMENTATION_SUMMARY.md`

### File Uploads
- [FILE_UPLOAD_GUIDE.md](FILE_UPLOAD_GUIDE.md)
- [URL_CONVERSION_IMPLEMENTATION.md](URL_CONVERSION_IMPLEMENTATION.md)
- Profile pictures, documents, images
- Absolute URL conversion

### API Testing
- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
- [SWAGGER_STATUS.md](SWAGGER_STATUS.md)

### Deployment
- [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)
- [NGROK_USAGE_GUIDE.md](NGROK_USAGE_GUIDE.md)

---

## 🔌 API Information

### Base URLs
- **Local:** http://localhost:8080/api/v1
- **Production:** https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1

### Swagger Documentation
- **Local:** http://localhost:8080/api-docs/
- **Production:** https://occupiable-milissa-ennuyante.ngrok-free.dev/api-docs/

### Authentication
- **Type:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Expiry:** 7 days (configurable)

---

## 📦 API Modules

### Core Modules
- **Authentication** - Login, register, OTP
- **Users** - User management
- **Providers** - Healthcare providers
- **Appointments** - Appointment scheduling
- **Documents** - Document management
- **Patient Education** - Educational content
- **Reviews** - Provider reviews
- **Support Tickets** - Support system

### Documentation Location
Module-specific documentation is in the main docs folder:
- `../../docs/APPOINTMENTS_MODULE_COMPLETE.md`
- `../../docs/DOCUMENTS_MODULE_COMPLETE.md`
- `../../docs/PATIENT_EDUCATION_MODULE_COMPLETE.md`
- etc.

---

## 🧪 Testing

### Test Scripts
Located in project root:
- `test-mobile-register-api.sh`
- `test-otp-flow.sh`
- `test-auto-otp-flow.sh`
- `test-patient-education-api.sh`

### Test Mode
```env
# .env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
NODE_ENV=development
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Setup Database
```bash
# Create database
createdb dentist_newdb

# Run migrations
psql -U dentist -d dentist_newdb -f database/create-tables.sql
```

### 4. Start Server
```bash
npm start
# or
npm run dev
```

### 5. Access API
- API: http://localhost:8080
- Swagger: http://localhost:8080/api-docs/
- Health: http://localhost:8080/health

---

## 📊 API Statistics

### Endpoints
- **Total:** 100+ endpoints
- **Versions:** v1
- **Authentication:** JWT
- **Documentation:** Swagger/OpenAPI

### Modules
- Authentication (10+ endpoints)
- Users (8 endpoints)
- Providers (10+ endpoints)
- Appointments (8 endpoints)
- Documents (6 endpoints)
- Patient Education (9 endpoints)
- Reviews (6 endpoints)
- Support Tickets (8 endpoints)

---

## 🔗 Related Documentation

### Main Documentation
- [Project README](../../README.md)
- [Complete Docs](../../docs/README.md)
- [Getting Started](../../docs/GETTING_STARTED.md)

### Mobile App
- [Mobile App Guide](../../docs/MOBILE_APP_COMPLETE_GUIDE.md)
- [OTP Testing](../../docs/OTP_TESTING_GUIDE.md)
- [Mobile Registration](../../docs/MOBILE_REGISTRATION_API.md)

---

## 🆘 Need Help?

### Quick Links
1. [API Quick Reference](API_QUICK_REFERENCE.md)
2. [Complete Documentation](COMPLETE_API_DOCUMENTATION.md)
3. [Testing Guide](API_TESTING_GUIDE.md)
4. [Swagger UI](http://localhost:8080/api-docs/)

### Common Issues
- Login problems → [LOGIN_FIX_SUMMARY.md](LOGIN_FIX_SUMMARY.md)
- File uploads → [FILE_UPLOAD_GUIDE.md](FILE_UPLOAD_GUIDE.md)
- Deployment → [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)

---

## 📝 Document Status

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Complete | 11 | Fully documented |
| 🔄 Updated | 3 | Recently updated |
| 📚 Reference | 14 | Total documents |

---

## 📅 Last Updated

**Date:** February 24, 2026

**Total Documents:** 14

**Status:** Production Ready ✓

---

**For complete project documentation, see [../../docs/README.md](../../docs/README.md)**
