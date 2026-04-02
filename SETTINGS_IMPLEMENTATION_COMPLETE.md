# Settings Module Implementation - Complete

## Overview
Created a comprehensive Settings management system with multiple tabs for configuring various system settings.

## Features Implemented

### 1. Database Table
- Created `settings` table with all required fields
- Single row configuration (ID: 00000000-0000-0000-0000-000000000001)
- Supports: Payment, SMTP, Branding, Invoice, Analytics, SMS/WhatsApp, SEO

### 2. Backend API
- Model: `api/src/models/settingsModel.js`
- Controller: `api/src/controllers/settingsController.js`
- Routes: `api/src/routes/v1/settingsRoutes.js`
- Endpoints:
  - GET `/api/v1/settings` - Get settings
  - PUT `/api/v1/settings` - Update settings
  - POST `/api/v1/settings/test-smtp` - Test SMTP connection
  - POST `/api/v1/settings/test-razorpay` - Test Razorpay connection
  - POST `/api/v1/settings/test-sms` - Test SMS connection

### 3. Frontend Component
- Component: `components/management/settings-crud.tsx`
- Page: `app/(defaults)/management/settings/page.tsx`
- 7 Tabs with comprehensive forms

## Settings Tabs

### 1. Payment Tab
- Razorpay Key ID
- Razorpay Key Secret
- Enable/Disable Razorpay
- Test Connection Button

### 2. Email Tab (SMTP)
- Mailer (SMTP)
- Host (e.g., smtp-relay.brevo.com)
- Port (587)
- Username
- Password
- From Address
- From Name
- Encryption (TLS/SSL)
- Test Connection Button

### 3. Branding Tab
- Site Logo Upload
- Site Name
- Favicon Upload
- Footer Text (Copyright)

### 4. Invoice Tab
- Invoice Prefix (INV)
- Starting Invoice Number
- Invoice Number Format ([prefix]-[number])

### 5. Analytics Tab
- Google Analytics Snippet
- Facebook Pixel Code
- Custom Tracking Code

### 6. SMS & WhatsApp Tab
- SMS Provider (Twilio, MSG91, Other)
- SMS API Key
- SMS API Secret
- SMS Sender ID
- Enable/Disable SMS
- WhatsApp API Key
- WhatsApp API Secret
- Enable/Disable WhatsApp
- Test Connection Button

### 7. SEO Tab
- Meta Title
- Meta Description
- Meta Keywords
- Open Graph Image Upload

## Installation Steps

### Step 1: Create Database Table
Run the SQL file to create the settings table:

```bash
# Option 1: Using psql command
psql -U dentist -d dentist_newdb -f api/database/create-settings-table.sql

# Option 2: Using pgAdmin or any PostgreSQL client
# Open api/database/create-settings-table.sql and execute it
```

### Step 2: Restart API Server
The API server needs to be restarted to load the new routes:

```bash
# Stop the current API server (Ctrl+C in the terminal where it's running)
# Then start it again:
cd api
npm start
```

### Step 3: Access Settings Page
Navigate to: `http://localhost:3000/management/settings`

## Files Created

### Backend
1. `api/database/create-settings-table.sql` - Database schema
2. `api/src/models/settingsModel.js` - Data access layer
3. `api/src/controllers/settingsController.js` - Business logic
4. `api/src/routes/v1/settingsRoutes.js` - API routes
5. `api/create-settings-table.js` - Migration script

### Frontend
1. `components/management/settings-crud.tsx` - Main settings component
2. `app/(defaults)/management/settings/page.tsx` - Settings page
3. `components/icon/icon-search-engine.tsx` - SEO icon

### Configuration
1. `api/src/routes/v1/index.js` - Added settings routes
2. `config/api.config.ts` - Added settings endpoint

## Security Features

- Sensitive data (passwords, secrets) are masked in API responses
- Only authenticated users can access settings
- Passwords shown as `***********` in GET responses
- Full values only sent during updates

## Test Connection Features

All connection tests return mock responses for now. To implement real testing:

### SMTP Test
Use nodemailer to send a test email:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({...});
await transporter.verify();
```

### Razorpay Test
Use Razorpay SDK to verify credentials:
```javascript
const Razorpay = require('razorpay');
const instance = new Razorpay({ key_id, key_secret });
await instance.payments.all();
```

### SMS Test
Use provider SDK (Twilio, MSG91) to send test SMS

## Usage

1. Navigate to Settings page
2. Click on any tab (Payment, Email, Branding, etc.)
3. Fill in the required fields
4. Click "Test Connection" button (for Payment, Email, SMS tabs)
5. Click "Save Settings" button at the top right
6. Settings are saved and applied system-wide

## API Examples

### Get Settings
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8090/api/v1/settings
```

### Update Settings
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"razorpay_key_id":"rzp_test_xxxxx","smtp_host":"smtp.example.com"}' \
  http://localhost:8090/api/v1/settings
```

### Test SMTP
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"smtp_host":"smtp.example.com","smtp_port":587,"smtp_username":"user","smtp_password":"pass"}' \
  http://localhost:8090/api/v1/settings/test-smtp
```

## Database Schema

```sql
settings (
  id UUID PRIMARY KEY,
  razorpay_key_id VARCHAR(255),
  razorpay_key_secret VARCHAR(255),
  razorpay_enabled BOOLEAN,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_username VARCHAR(255),
  smtp_password VARCHAR(255),
  smtp_from_address VARCHAR(255),
  smtp_from_name VARCHAR(255),
  smtp_encryption VARCHAR(20),
  site_logo TEXT,
  site_name VARCHAR(255),
  favicon TEXT,
  footer_text TEXT,
  invoice_prefix VARCHAR(20),
  invoice_starting_number INTEGER,
  invoice_number_format VARCHAR(50),
  google_analytics_code TEXT,
  facebook_pixel_code TEXT,
  custom_tracking_code TEXT,
  sms_provider VARCHAR(50),
  sms_api_key VARCHAR(255),
  sms_api_secret VARCHAR(255),
  sms_sender_id VARCHAR(50),
  sms_enabled BOOLEAN,
  whatsapp_api_key VARCHAR(255),
  whatsapp_api_secret VARCHAR(255),
  whatsapp_enabled BOOLEAN,
  seo_meta_title VARCHAR(255),
  seo_meta_description TEXT,
  seo_meta_keywords TEXT,
  seo_og_image TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by UUID
)
```

## Next Steps

1. Run the database migration (see Step 1 above)
2. Restart the API server
3. Add Settings link to the navigation menu
4. Test all tabs and save functionality
5. Implement real connection testing (optional)
6. Add file upload functionality for logos and images

## Notes

- Only one settings row exists in the database
- All updates modify the same row
- Sensitive data is automatically masked in responses
- File uploads for logos/images need to be implemented separately
- Connection tests currently return mock responses
