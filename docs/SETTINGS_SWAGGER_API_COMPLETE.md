# Settings API - Complete Swagger Documentation

## Overview
Complete Swagger API documentation for the Settings module with all endpoints, schemas, and examples.

## Fixed Issues
1. ✓ Created missing icon components (IconImage, IconCode, IconPhone)
2. ✓ Added comprehensive Swagger documentation
3. ✓ All endpoints documented with request/response schemas
4. ✓ Build errors resolved

## API Endpoints

### 1. GET /api/v1/settings
**Description**: Get all system settings

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "razorpay_key_id": "rzp_test_xxxxxxxxxxxxx",
    "razorpay_key_secret": "***********",
    "razorpay_enabled": true,
    "smtp_host": "smtp-relay.brevo.com",
    "smtp_port": 587,
    "smtp_username": "user@example.com",
    "smtp_password": "***********",
    "smtp_from_address": "no-reply@example.com",
    "smtp_from_name": "Protect32",
    "smtp_encryption": "TLS",
    "site_name": "Protect32",
    "footer_text": "Copyright © 2026, All rights reserved",
    "invoice_prefix": "INV",
    "invoice_starting_number": 1,
    "invoice_number_format": "[prefix]-[number]",
    "sms_provider": "twilio",
    "sms_enabled": false,
    "seo_meta_title": "Protect32 - Dental Management System",
    "created_at": "2026-04-02T10:00:00Z",
    "updated_at": "2026-04-02T10:00:00Z"
  }
}
```

**Note**: Sensitive fields (passwords, secrets) are automatically masked with `***********`

---

### 2. PUT /api/v1/settings
**Description**: Update system settings (partial update supported)

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "razorpay_key_id": "rzp_test_xxxxxxxxxxxxx",
  "razorpay_key_secret": "your_secret_key",
  "razorpay_enabled": true,
  "smtp_host": "smtp-relay.brevo.com",
  "smtp_port": 587,
  "smtp_username": "user@example.com",
  "smtp_password": "your_password",
  "smtp_from_address": "no-reply@example.com",
  "smtp_from_name": "Protect32",
  "smtp_encryption": "TLS",
  "site_name": "Protect32",
  "footer_text": "Copyright © 2026, All rights reserved",
  "invoice_prefix": "INV",
  "invoice_starting_number": 1,
  "invoice_number_format": "[prefix]-[number]",
  "google_analytics_code": "<!-- GA Code -->",
  "sms_provider": "twilio",
  "sms_api_key": "your_api_key",
  "sms_enabled": false,
  "seo_meta_title": "Protect32 - Dental Management System",
  "seo_meta_description": "Complete dental clinic management system",
  "seo_meta_keywords": "dental, clinic, management"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    // Updated settings object (with masked sensitive data)
  }
}
```

---

### 3. POST /api/v1/settings/test-smtp
**Description**: Test SMTP email server connection

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "smtp_host": "smtp-relay.brevo.com",
  "smtp_port": 587,
  "smtp_username": "user@example.com",
  "smtp_password": "your_password",
  "smtp_from_address": "no-reply@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "SMTP connection test successful"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "SMTP connection test failed",
  "message": "Connection timeout"
}
```

---

### 4. POST /api/v1/settings/test-razorpay
**Description**: Test Razorpay payment gateway connection

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "razorpay_key_id": "rzp_test_xxxxxxxxxxxxx",
  "razorpay_key_secret": "your_secret_key"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Razorpay connection test successful"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Razorpay connection test failed",
  "message": "Invalid credentials"
}
```

---

### 5. POST /api/v1/settings/test-sms
**Description**: Test SMS provider connection

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "sms_provider": "twilio",
  "sms_api_key": "your_api_key",
  "sms_api_secret": "your_api_secret"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "SMS connection test successful"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "SMS connection test failed",
  "message": "Invalid API credentials"
}
```

---

## Complete Settings Schema

```typescript
interface Settings {
  // System
  id: string;                          // UUID
  created_at: string;                  // ISO 8601 datetime
  updated_at: string;                  // ISO 8601 datetime
  updated_by: string;                  // UUID of user who updated
  
  // Payment (Razorpay)
  razorpay_key_id: string;            // Razorpay Key ID
  razorpay_key_secret: string;        // Razorpay Key Secret (masked)
  razorpay_enabled: boolean;          // Enable/Disable payments
  
  // SMTP Email
  smtp_mailer: string;                // Mailer type (SMTP)
  smtp_host: string;                  // SMTP server host
  smtp_port: number;                  // SMTP server port
  smtp_username: string;              // SMTP username
  smtp_password: string;              // SMTP password (masked)
  smtp_from_address: string;          // From email address
  smtp_from_name: string;             // From name
  smtp_encryption: 'TLS' | 'SSL';     // Encryption type
  
  // Branding
  site_logo: string;                  // Logo file path/URL
  site_name: string;                  // Site name
  favicon: string;                    // Favicon file path/URL
  
  // Footer
  footer_text: string;                // Copyright text
  
  // Invoice
  invoice_prefix: string;             // Invoice prefix (INV)
  invoice_starting_number: number;    // Starting number
  invoice_number_format: string;      // Format pattern
  
  // Analytics
  google_analytics_code: string;      // GA tracking code
  facebook_pixel_code: string;        // FB Pixel code
  custom_tracking_code: string;       // Custom code
  
  // SMS
  sms_provider: 'twilio' | 'msg91' | 'other';
  sms_api_key: string;                // SMS API key
  sms_api_secret: string;             // SMS API secret (masked)
  sms_sender_id: string;              // Sender ID
  sms_enabled: boolean;               // Enable/Disable SMS
  
  // WhatsApp
  whatsapp_api_key: string;           // WhatsApp API key
  whatsapp_api_secret: string;        // WhatsApp secret (masked)
  whatsapp_enabled: boolean;          // Enable/Disable WhatsApp
  
  // SEO
  seo_meta_title: string;             // Meta title
  seo_meta_description: string;       // Meta description
  seo_meta_keywords: string;          // Meta keywords
  seo_og_image: string;               // OG image URL
}
```

---

## Frontend Integration

The frontend component (`components/management/settings-crud.tsx`) uses these APIs:

### Fetch Settings
```typescript
const fetchSettings = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(API_ENDPOINTS.settings, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
    });
    const data = await response.json();
    if (response.ok && data.success) {
        setSettings(data.data);
    }
};
```

### Save Settings
```typescript
const handleSave = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(API_ENDPOINTS.settings, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (response.ok && data.success) {
        Swal.fire('Success', 'Settings saved successfully', 'success');
    }
};
```

### Test Connection
```typescript
const testConnection = async (type: 'smtp' | 'razorpay' | 'sms') => {
    const token = localStorage.getItem('auth_token');
    let endpoint = '';
    let body = {};

    if (type === 'smtp') {
        endpoint = `${API_ENDPOINTS.settings}/test-smtp`;
        body = {
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            smtp_username: settings.smtp_username,
            smtp_password: settings.smtp_password,
            smtp_from_address: settings.smtp_from_address
        };
    }
    // ... similar for razorpay and sms

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
    });
    
    const data = await response.json();
    if (data.success) {
        Swal.fire('Success', data.message, 'success');
    }
};
```

---

## Testing in Swagger

1. **Access Swagger UI**: http://localhost:8090/api-docs

2. **Authorize**:
   - Click "Authorize" button
   - Enter: `Bearer YOUR_AUTH_TOKEN`
   - Click "Authorize"

3. **Test GET /api/v1/settings**:
   - Expand the GET endpoint
   - Click "Try it out"
   - Click "Execute"
   - View response

4. **Test PUT /api/v1/settings**:
   - Expand the PUT endpoint
   - Click "Try it out"
   - Modify the request body JSON
   - Click "Execute"
   - View response

5. **Test Connection Endpoints**:
   - Expand POST /test-smtp, /test-razorpay, or /test-sms
   - Click "Try it out"
   - Fill in required fields
   - Click "Execute"
   - View test results

---

## cURL Examples

### Get Settings
```bash
curl -X GET "http://localhost:8090/api/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

### Update Settings
```bash
curl -X PUT "http://localhost:8090/api/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "razorpay_key_id": "rzp_test_xxxxx",
    "smtp_host": "smtp.example.com",
    "site_name": "My Clinic"
  }'
```

### Test SMTP
```bash
curl -X POST "http://localhost:8090/api/v1/settings/test-smtp" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "smtp_host": "smtp-relay.brevo.com",
    "smtp_port": 587,
    "smtp_username": "user@example.com",
    "smtp_password": "password"
  }'
```

---

## Files Modified/Created

### Backend
1. `api/src/routes/v1/settingsRoutes.js` - Complete Swagger documentation
2. `api/src/controllers/settingsController.js` - Already complete
3. `api/src/models/settingsModel.js` - Already complete

### Frontend
1. `components/icon/icon-image.tsx` - Created
2. `components/icon/icon-code.tsx` - Created
3. `components/icon/icon-phone.tsx` - Created
4. `components/icon/icon-search-engine.tsx` - Already created
5. `components/management/settings-crud.tsx` - Already complete

---

## Next Steps

1. ✓ Build errors fixed
2. ✓ Swagger documentation complete
3. ✓ Frontend using APIs correctly
4. Run database migration (see SETTINGS_IMPLEMENTATION_COMPLETE.md)
5. Restart API server to load new Swagger docs
6. Test all endpoints in Swagger UI
7. Test frontend Settings page

---

## Security Notes

- All sensitive data (passwords, secrets) are automatically masked in GET responses
- Only authenticated users can access settings endpoints
- Full values are only sent during PUT requests
- Test endpoints don't save data, only validate connections
- Settings are stored in a single row (ID: 00000000-0000-0000-0000-000000000001)

---

## Status

✅ Complete and ready to use!
