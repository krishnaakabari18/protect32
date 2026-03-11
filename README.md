# Dentist Management System

Complete dental clinic management system with API backend and Next.js frontend.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd protect32

# Install API dependencies
cd api
npm install

# Install Frontend dependencies
cd ../backend
npm install
```

### Configuration

1. **Database Setup:**
   ```bash
   # Create database
   createdb dentist_newdb
   
   # Run migrations
   cd api/database
   psql -U dentist -d dentist_newdb -f create-tables.sql
   ```

2. **Environment Variables:**
   ```bash
   # API (.env)
   cp api/.env.example api/.env
   # Edit api/.env with your configuration
   
   # Frontend (.env.local)
   cp backend/.env.example backend/.env.local
   # Edit backend/.env.local with your configuration
   ```

### Running the Application

```bash
# Start API server (port 8080)
cd api
npm start

# Start Frontend (port 3000)
cd backend
npm run dev
```

### Access

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8080
- **Swagger Docs:** http://localhost:8080/api-docs/
- **Admin Panel:** http://localhost:3000/management

### Default Credentials

- **Email:** admin@dentist.com
- **Password:** password123

---

## 📚 Documentation

Complete documentation is available in the [docs](docs/) folder.

### Essential Guides

- [📖 Complete Documentation Index](docs/README.md)
- [🚀 Quick Reference](docs/QUICK_REFERENCE.md)
- [⚙️ Setup Guide](docs/SETUP_COMPLETE.md)
- [🏃 Running Guide](docs/PROJECT_RUNNING_GUIDE.md)

### API Documentation

- [🔐 Authentication](docs/AUTH_IMPLEMENTATION_SUMMARY.md)
- [📱 Mobile Registration](docs/MOBILE_REGISTRATION_API.md)
- [🔢 OTP Testing](docs/OTP_TESTING_GUIDE.md)
- [📡 API Configuration](docs/API_CONFIGURATION_REFACTORING.md)

### Module Documentation

- [👥 Users & Providers](docs/USERS_COMPLETE_WITH_PHOTOS_AND_STATUS.md)
- [📅 Appointments](docs/APPOINTMENTS_MODULE_COMPLETE.md)
- [📄 Documents](docs/DOCUMENTS_MODULE_COMPLETE.md)
- [📚 Patient Education](docs/PATIENT_EDUCATION_MODULE_COMPLETE.md)
- [⭐ Reviews](docs/REVIEWS_MODULE_TESTING.md)
- [🎫 Support Tickets](docs/SUPPORT_TICKETS_MODULE_COMPLETE.md)

### Mobile App Integration

- [📱 Complete Mobile Guide](docs/MOBILE_APP_COMPLETE_GUIDE.md)
- [🔐 Auto OTP Registration](docs/AUTO_OTP_REGISTRATION_GUIDE.md)
- [✅ OTP Verification](docs/VERIFY_OTP_API_UPDATED.md)

---

## 🏗️ Project Structure

```
protect32/
├── api/                      # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Middleware
│   │   ├── utils/            # Utilities
│   │   └── config/           # Configuration
│   ├── database/             # SQL scripts
│   ├── uploads/              # File uploads
│   └── .env                  # Environment variables
│
├── backend/                  # Frontend (Next.js + React)
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── config/               # Frontend config
│   ├── utils/                # Utilities
│   └── public/               # Static files
│
├── docs/                     # Documentation
│   ├── README.md             # Documentation index
│   └── *.md                  # All documentation files
│
└── README.md                 # This file
```

---

## 🔑 Key Features

### Backend API
- ✅ RESTful API with versioning (v1)
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ File upload (images, documents)
- ✅ OTP verification (SMS)
- ✅ Swagger/OpenAPI documentation
- ✅ PostgreSQL database
- ✅ Error handling & logging

### Frontend
- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Responsive design
- ✅ Admin dashboard
- ✅ User management
- ✅ Appointment scheduling
- ✅ Document management
- ✅ Rich text editor

### Mobile API
- ✅ Mobile registration
- ✅ Auto OTP sending
- ✅ OTP verification
- ✅ JWT tokens
- ✅ Test mode (OTP: 123456)

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **OTP:** Twilio (optional)
- **Documentation:** Swagger/OpenAPI
- **Validation:** Express Validator

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **HTTP Client:** Fetch API
- **Rich Text:** React Quill

### Database
- **RDBMS:** PostgreSQL 14+
- **ORM:** Raw SQL queries
- **Migrations:** SQL scripts

---

## 📡 API Endpoints

### Base URLs
- **Local:** http://localhost:8080/api/v1
- **Production:** https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/mobile-register` - Mobile registration (auto OTP)
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/refresh-token` - Refresh token
- `GET /auth/profile` - Get profile

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Providers
- `GET /providers` - Get all providers
- `POST /providers` - Create provider
- `PUT /providers/:id` - Update provider
- `DELETE /providers/:id` - Delete provider

#### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

#### Documents
- `GET /documents` - Get all documents
- `POST /documents` - Upload document
- `DELETE /documents/:id` - Delete document

#### Patient Education
- `GET /patient-education` - Get all content
- `POST /patient-education` - Create content
- `PUT /patient-education/:id` - Update content
- `DELETE /patient-education/:id` - Delete content

#### Reviews
- `GET /reviews` - Get all reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review

#### Support Tickets
- `GET /support-tickets` - Get all tickets
- `POST /support-tickets` - Create ticket
- `POST /support-tickets/:id/replies` - Add reply

---

## 🧪 Testing

### API Testing

```bash
# Test mobile registration
./test-mobile-register-api.sh

# Test OTP flow
./test-otp-flow.sh

# Test auto OTP registration
./test-auto-otp-flow.sh

# Test patient education API
./test-patient-education-api.sh
```

### Test Mode Configuration

```env
# api/.env
OTP_TEST_MODE=true
OTP_TEST_CODE=123456
```

### Default Test OTP
```
123456
```

---

## 🔐 Security

### Authentication
- JWT tokens with expiry
- Refresh tokens
- Password hashing (bcrypt)
- Role-based access control

### API Security
- CORS enabled
- Request validation
- SQL injection prevention
- File upload validation
- Rate limiting (recommended)

### OTP Security
- 10-minute expiry
- Max 3 attempts
- One-time use
- Purpose-based validation

---

## 🚢 Deployment

### Production Checklist

1. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secret
   - Configure Twilio for SMS

2. **Database:**
   - Run migrations
   - Create indexes
   - Set up backups

3. **API:**
   - Enable HTTPS
   - Configure CORS
   - Set up logging
   - Enable rate limiting

4. **Frontend:**
   - Build production bundle
   - Configure API URLs
   - Enable caching

5. **OTP:**
   - Set `OTP_TEST_MODE=false`
   - Configure Twilio credentials

---

## 📊 Database Schema

### Main Tables
- `users` - User accounts
- `providers` - Healthcare providers
- `appointments` - Appointment bookings
- `documents` - Document storage
- `patient_education_content` - Educational content
- `reviews` - Provider reviews
- `support_tickets` - Support tickets
- `otps` - OTP verification codes
- `refresh_tokens` - JWT refresh tokens

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary and confidential.

---

## 📞 Support

For support and questions:
- 📧 Email: support@dentist.com
- 📚 Documentation: [docs/README.md](docs/README.md)
- 🐛 Issues: GitHub Issues

---

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Express.js community
- PostgreSQL team
- All contributors

---

## 📅 Version History

### v1.0.0 (February 24, 2026)
- ✅ Initial release
- ✅ Complete API implementation
- ✅ Frontend dashboard
- ✅ Mobile registration with auto OTP
- ✅ All modules implemented
- ✅ Complete documentation

---

**Made with ❤️ for dental clinics**
