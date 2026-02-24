# Dentist Management System - API

Node.js/Express REST API for the Dentist Management System.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:create    # Create tables
npm run db:seed      # Seed dummy data

# Start development server
npm run dev

# Start production server
npm start
```

## API Documentation

- **Swagger UI**: http://localhost:8080/api-docs
- **API Base URL**: http://localhost:8080/api/v1

## Environment Setup

Create a `.env` file:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=7d
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## Test Credentials

After running `npm run db:seed`:

**Admin:**
- Email: `admin@dentist.com`
- Password: `password123`

**Provider:**
- Email: `dr.smith@dentist.com`
- Password: `password123`

**Patient:**
- Email: `john.doe@email.com`
- Password: `password123`

## Project Structure

```
api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   │   └── v1/         # Version 1 routes
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── database/
│   ├── schema.sql      # Database schema
│   ├── create-tables.js # Table creation script
│   ├── seed-data.js    # Seed script
│   └── clear-data.js   # Clear data script
├── uploads/            # File uploads (role-based)
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/send-otp` - Send OTP to mobile
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/google` - Google OAuth
- `POST /api/v1/auth/facebook` - Facebook OAuth
- `POST /api/v1/auth/apple` - Apple OAuth
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/change-password` - Change password

### Users
- `POST /api/v1/users` - Create user (with file upload)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user (with file upload)
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/:id/profile-picture` - Upload profile picture

### Patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients` - Get all patients
- `GET /api/v1/patients/:id` - Get patient by ID
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

### Providers
- `POST /api/v1/providers` - Create provider
- `GET /api/v1/providers` - Get all providers
- `GET /api/v1/providers/:id` - Get provider by ID
- `PUT /api/v1/providers/:id` - Update provider
- `DELETE /api/v1/providers/:id` - Delete provider

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments` - Get all appointments
- `GET /api/v1/appointments/:id` - Get appointment by ID
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Delete appointment

### Treatment Plans
- `POST /api/v1/plans` - Create treatment plan
- `GET /api/v1/plans` - Get all plans
- `GET /api/v1/plans/:id` - Get plan by ID
- `PUT /api/v1/plans/:id` - Update plan
- `DELETE /api/v1/plans/:id` - Delete plan

### Prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `GET /api/v1/prescriptions` - Get all prescriptions
- `GET /api/v1/prescriptions/:id` - Get prescription by ID
- `PUT /api/v1/prescriptions/:id` - Update prescription
- `DELETE /api/v1/prescriptions/:id` - Delete prescription

### Payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/payments/:id` - Get payment by ID
- `PUT /api/v1/payments/:id` - Update payment
- `DELETE /api/v1/payments/:id` - Delete payment

### Documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents` - Get all documents
- `GET /api/v1/documents/:id` - Get document by ID
- `DELETE /api/v1/documents/:id` - Delete document

### Chat
- `POST /api/v1/chat/messages` - Send message
- `GET /api/v1/chat/messages` - Get messages
- `GET /api/v1/chat/rooms` - Get chat rooms

### Notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews` - Get reviews
- `GET /api/v1/reviews/:id` - Get review by ID
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

## File Uploads

### Profile Pictures
- **Endpoint**: POST with `multipart/form-data`
- **Field name**: `profile_picture`
- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Storage**: `uploads/{user_type}/profile_pictures/`

### Documents
- **Endpoint**: POST with `multipart/form-data`
- **Field name**: `document`
- **Allowed formats**: Images, PDF, Word
- **Max size**: 10MB
- **Storage**: `uploads/{user_type}/documents/`

See `FILE_UPLOAD_GUIDE.md` for detailed upload documentation.

## Testing with ngrok

```bash
ngrok http 8080
```

Add header to all requests:
```
ngrok-skip-browser-warning: true
```

See `NGROK_USAGE_GUIDE.md` for details.

## Database Scripts

```bash
# Create all tables
npm run db:create

# Seed dummy data
npm run db:seed

# Clear all data (use with caution)
node database/clear-data.js
```

## Additional Documentation

- `API_QUICK_REFERENCE.md` - Quick API reference
- `API_TESTING_GUIDE.md` - Testing guide with examples
- `FILE_UPLOAD_GUIDE.md` - File upload documentation
- `NGROK_USAGE_GUIDE.md` - ngrok setup and usage
- `SWAGGER_STATUS.md` - Swagger documentation status
- `COMPLETE_API_DOCUMENTATION.md` - Complete API docs

## Technology Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI
- **Validation**: express-validator
- **OTP**: Twilio SMS
- **Email**: Nodemailer

## Development

```bash
# Start with auto-reload
npm run dev

# Check syntax
node -c src/server.js

# Run specific script
node database/seed-data.js
```

## Production

```bash
# Start production server
npm start

# Or with PM2
pm2 start src/server.js --name dentist-api
```

## Security

- JWT tokens for authentication
- bcrypt password hashing
- CORS enabled
- File type validation
- File size limits
- SQL injection prevention (parameterized queries)
- XSS protection

## Support

For issues or questions, check the documentation files or API documentation at `/api-docs`.
