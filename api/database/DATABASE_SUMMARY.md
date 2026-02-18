# Database Summary - Protect32 Dental Application

## Overview

Complete PostgreSQL database schema for a comprehensive dental application supporting patients, providers, and administrators.

## Database Statistics

- **Total Tables**: 30+
- **Total Relationships**: 50+
- **Indexes**: 40+
- **Triggers**: 15+
- **Functions**: 2

## Core Modules

### 1. Authentication & User Management
**Tables**: users, otp_verifications, refresh_tokens

**Features**:
- Multi-method authentication (email, mobile, social)
- JWT token management with refresh tokens
- OTP verification for mobile numbers
- Online/offline status tracking
- User type segregation (patient, provider, admin)

### 2. Provider Management
**Tables**: providers, provider_schedules, provider_fees, provider_reviews, operatories

**Features**:
- Detailed provider profiles with clinic information
- Flexible weekly scheduling (morning, afternoon, evening slots)
- Dynamic fee structure per procedure
- Rating and review system with auto-calculation
- Multi-operatory support for larger practices
- Geolocation for provider search

### 3. Patient Management
**Tables**: patients, family_members

**Features**:
- Patient profiles with medical history
- Family member management for group plans
- Emergency contact information
- Insurance details tracking

### 4. Appointment System
**Tables**: appointments, appointment_forms

**Features**:
- Comprehensive appointment scheduling
- Status tracking (Upcoming, Completed, Cancelled, No-Show)
- Pre-appointment forms with medical/dental history
- Operatory assignment
- Cancellation reason tracking

### 5. Treatment Planning
**Tables**: treatment_plans, treatment_plan_items, post_treatment_records

**Features**:
- Multi-item treatment plans
- Consent workflow
- Discount application
- Payment tracking
- Post-treatment oral health status recording

### 6. Plans & Subscriptions
**Tables**: plans, patient_plans

**Features**:
- Multiple plan tiers with different benefits
- Family plan support (multiple members)
- Automatic discount application
- Free services tracking (checkups, cleanings, X-rays)
- Auto-renewal support

### 7. Financial Management
**Tables**: payments, settlements

**Features**:
- Payment processing and tracking
- Multiple payment methods
- Provider settlement claims
- Settlement workflow (Pending → Processing → Settled/Rejected)
- Transaction history

### 8. Document Management
**Tables**: documents, prescriptions

**Features**:
- Document vault for X-rays, reports, insurance
- Prescription tracking with refills
- File metadata storage
- Upload tracking

### 9. Referral System
**Tables**: network_providers, referrals

**Features**:
- Network provider directory (dentists, labs, radiology)
- Referral tracking between providers
- Referral status workflow
- Reason and notes tracking

### 10. Communication
**Tables**: chat_rooms, chat_participants, chat_messages, message_read_receipts, notifications

**Features**:
- Real-time chat (Socket.IO integration)
- Multiple room types (direct, group, support)
- Message types (text, image, file, audio, video)
- Read receipts
- Comprehensive notification system
- Multiple notification types

### 11. Administration
**Tables**: admin_forms, app_versions

**Features**:
- Administrative form management
- App version control with force update
- Platform-specific versioning (iOS, Android, Web)
- Release notes management

## Key Design Patterns

### 1. UUID Primary Keys
All tables use UUID for better security, distribution, and avoiding sequential ID enumeration attacks.

### 2. Soft Deletes
Most foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` to maintain referential integrity while preserving historical data where needed.

### 3. Timestamps
All major tables include `created_at` and `updated_at` timestamps with automatic triggers.

### 4. JSONB for Flexibility
Used for:
- Provider coordinates (geolocation)
- Plan color schemes
- Form data (flexible structure)
- Message metadata
- Device information

### 5. PostgreSQL Arrays
Used for:
- Plan features
- Clinic photos
- Medical conditions
- Dental habits

### 6. Check Constraints
Database-level validation for:
- User types
- Appointment status
- Payment status
- Notification types
- And more...

### 7. Automatic Calculations
Triggers automatically update:
- Provider ratings when reviews are added
- Updated timestamps on record changes

## Performance Optimizations

### Indexes
- Foreign key indexes for fast joins
- Status field indexes for filtering
- Date indexes for time-based queries
- Composite indexes for common query patterns

### Connection Pooling
- Maximum 20 connections
- 30-second idle timeout
- 2-second connection timeout

### Query Optimization
- Prepared statements via pg library
- Transaction support for complex operations
- Helper functions for common patterns

## Security Features

1. **Password Hashing**: bcrypt with configurable salt rounds
2. **JWT Tokens**: Separate access and refresh tokens
3. **OTP Expiry**: Time-limited OTP codes
4. **Token Revocation**: Refresh token revocation support
5. **Input Validation**: Check constraints at database level
6. **Parameterized Queries**: Protection against SQL injection
7. **Rate Limiting**: Recommended for OTP and login endpoints
8. **HTTPS Only**: All production endpoints should use HTTPS

## Data Relationships

### One-to-One
- users → patients
- users → providers
- appointments → appointment_forms

### One-to-Many
- users → appointments
- users → notifications
- providers → provider_schedules (7 days)
- providers → provider_fees
- providers → appointments
- patients → family_members
- patients → documents
- treatment_plans → treatment_plan_items
- chat_rooms → chat_messages

### Many-to-Many
- chat_rooms ↔ users (via chat_participants)

## File Structure

```
database/
├── schema.sql              # Complete database schema
├── seed.sql               # Sample data for testing
├── config.ts              # Database connection configuration
├── DATABASE_SUMMARY.md    # This file
├── QUICK_REFERENCE.md     # SQL query examples
└── README-DATABASE.md     # Setup and usage guide
```

## Environment Variables

Required in `.env.local`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dental_app
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

PORT=5000
CLIENT_URL=http://localhost:3000
```

## Setup Commands

```bash
# Create database
createdb dental_app

# Run schema
psql -d dental_app -f database/schema.sql

# Seed data
psql -d dental_app -f database/seed.sql

# Backup
pg_dump dental_app > backup.sql

# Restore
psql dental_app < backup.sql
```

## API Integration Points

The database supports the following API endpoints:

1. **Authentication**: Register, login, OTP, social login, token refresh
2. **Providers**: Search, profile, schedule, fees, reviews
3. **Appointments**: Create, update, cancel, forms
4. **Treatment Plans**: Create, consent, payment
5. **Plans**: Browse, subscribe, manage
6. **Payments**: Process, history
7. **Documents**: Upload, download, delete
8. **Prescriptions**: Create, view
9. **Chat**: Rooms, messages, read receipts
10. **Notifications**: List, mark read
11. **Referrals**: Create, track
12. **Admin**: Forms, version management

## Testing Data

The seed file includes:
- 3 sample patients
- 3 sample providers with full profiles
- 4 sample appointments
- 2 treatment plans
- 4 subscription plans
- Provider schedules and fees
- Chat rooms and messages
- Notifications
- Documents and prescriptions

## Next Steps

1. **Backend Development**: Implement API endpoints using Express.js
2. **Socket.IO**: Set up real-time chat and notifications
3. **File Storage**: Integrate S3 or similar for documents
4. **Payment Gateway**: Integrate Razorpay/Stripe
5. **SMS Service**: Integrate Twilio for OTP
6. **Email Service**: Set up SendGrid for notifications
7. **Testing**: Write unit and integration tests
8. **Deployment**: Set up production database (AWS RDS, etc.)
9. **Monitoring**: Add database monitoring and alerts
10. **Backup**: Set up automated backups

## Support

For questions or issues:
1. Check QUICK_REFERENCE.md for SQL examples
2. Review README-DATABASE.md for setup instructions
3. Examine schema.sql for table definitions
4. Test with seed.sql data

## Version

Database Schema Version: 1.0.0
Last Updated: 2024
