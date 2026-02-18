# Dentist Management System

A complete dental practice management system with Node.js API backend and React admin UI.

## Project Structure

```
protect32/
├── api/                    # Node.js Backend API
│   ├── src/               # API source code
│   ├── database/          # Database scripts and seeds
│   ├── uploads/           # File uploads (role-based)
│   ├── package.json       # API dependencies
│   └── .env              # API environment variables
│
├── protect/               # React Admin UI
│   ├── components/        # React components
│   ├── services/          # API service layer
│   ├── utils/            # Utility functions
│   ├── package.json      # UI dependencies
│   └── .env.local        # UI environment variables
│
└── README.md             # This file
```

## Quick Start

### 1. Setup API (Backend)

```bash
cd api
npm install
npm run db:create    # Create database tables
npm run db:seed      # Seed with dummy data
npm run dev          # Start development server
```

API will run on: `http://localhost:8080`
API Documentation: `http://localhost:8080/api-docs`

### 2. Setup Admin UI (Frontend)

```bash
cd protect
npm install
npm run dev          # Start development server
```

Admin UI will run on: `http://localhost:5173` (or similar)

## API Backend

### Technology Stack
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Swagger/OpenAPI documentation
- Multer for file uploads
- bcrypt for password hashing

### Key Features
- User management (patients, providers, admins)
- Authentication (email/password, OTP, social login)
- Appointment scheduling
- Treatment plans and prescriptions
- Payment processing
- Document management
- Real-time chat
- Notifications
- Reviews and ratings

### API Endpoints
All endpoints are versioned: `/api/v1/*`

Main modules:
- `/api/v1/auth` - Authentication
- `/api/v1/users` - User management
- `/api/v1/patients` - Patient records
- `/api/v1/providers` - Provider profiles
- `/api/v1/appointments` - Appointments
- `/api/v1/plans` - Treatment plans
- `/api/v1/prescriptions` - Prescriptions
- `/api/v1/payments` - Payments
- `/api/v1/documents` - Documents
- `/api/v1/chat` - Chat messages
- `/api/v1/notifications` - Notifications
- `/api/v1/reviews` - Reviews

See `api/API_README.md` for detailed API documentation.

## Admin UI

### Technology Stack
- React + TypeScript
- Vite build tool
- Modern UI components
- API integration

### Features
- Dashboard overview
- User management
- Appointment management
- Patient records
- Provider management
- Treatment plans
- Payment tracking
- Document management
- Reports and analytics

## Database

### PostgreSQL Setup
Database name: `dentist_newdb`

Tables include:
- users, patients, providers
- appointments, appointment_forms
- treatment_plans, prescriptions
- payments, settlements
- documents, chat_messages
- notifications, reviews
- and more...

### Test Credentials
After seeding, use these credentials:

**Admin:**
- Email: `admin@dentist.com`
- Password: `password123`

**Provider:**
- Email: `dr.smith@dentist.com`
- Password: `password123`

**Patient:**
- Email: `john.doe@email.com`
- Password: `password123`

## Environment Variables

### API (.env in api folder)
```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=7d
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
```

### Admin UI (.env.local in protect folder)
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Development

### API Development
```bash
cd api
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm run db:create    # Create database tables
npm run db:seed      # Seed dummy data
```

### UI Development
```bash
cd protect
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment

### Using ngrok for Testing
```bash
# In api folder
ngrok http 8080
```

When using ngrok, add header to requests:
```
ngrok-skip-browser-warning: true
```

See `api/NGROK_USAGE_GUIDE.md` for details.

## File Uploads

Profile pictures and documents are organized by user role:
```
api/uploads/
├── patient/
│   ├── profile_pictures/
│   └── documents/
├── provider/
│   ├── profile_pictures/
│   └── documents/
└── admin/
    ├── profile_pictures/
    └── documents/
```

See `api/FILE_UPLOAD_GUIDE.md` for upload API documentation.

## Documentation

- `api/API_README.md` - Complete API documentation
- `api/API_QUICK_REFERENCE.md` - Quick API reference
- `api/API_TESTING_GUIDE.md` - Testing guide
- `api/FILE_UPLOAD_GUIDE.md` - File upload guide
- `api/NGROK_USAGE_GUIDE.md` - ngrok setup guide
- `api/SWAGGER_STATUS.md` - Swagger documentation status
- `protect/README.md` - Admin UI documentation

## Support

For issues or questions, refer to the documentation files in the respective folders.

## License

ISC
