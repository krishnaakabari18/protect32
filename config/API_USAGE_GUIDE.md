# API Configuration Usage Guide

## Quick Reference

### Import the Configuration
```typescript
import { API_ENDPOINTS, BASE_URL, API_BASE_URL } from '@/config/api.config';
```

## Available Endpoints

### Authentication
```typescript
API_ENDPOINTS.auth.login          // POST /api/v1/auth/login
API_ENDPOINTS.auth.logout         // POST /api/v1/auth/logout
API_ENDPOINTS.auth.register       // POST /api/v1/auth/register
API_ENDPOINTS.auth.verifyOtp      // POST /api/v1/auth/verify-otp
API_ENDPOINTS.auth.resendOtp      // POST /api/v1/auth/resend-otp
API_ENDPOINTS.auth.forgotPassword // POST /api/v1/auth/forgot-password
API_ENDPOINTS.auth.resetPassword  // POST /api/v1/auth/reset-password
```

### Resources
```typescript
API_ENDPOINTS.users           // /api/v1/users
API_ENDPOINTS.patients        // /api/v1/patients
API_ENDPOINTS.providers       // /api/v1/providers
API_ENDPOINTS.appointments    // /api/v1/appointments
API_ENDPOINTS.treatmentPlans  // /api/v1/treatment-plans
API_ENDPOINTS.prescriptions   // /api/v1/prescriptions
API_ENDPOINTS.plans           // /api/v1/plans
API_ENDPOINTS.payments        // /api/v1/payments
API_ENDPOINTS.documents       // /api/v1/documents
API_ENDPOINTS.reviews         // /api/v1/reviews
API_ENDPOINTS.notifications   // /api/v1/notifications
API_ENDPOINTS.chat            // /api/v1/chat
```

## Common Patterns

### 1. Fetch All Items
```typescript
const response = await fetch(API_ENDPOINTS.users, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### 2. Fetch Single Item by ID
```typescript
const response = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### 3. Create New Item
```typescript
const response = await fetch(API_ENDPOINTS.users, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
  body: JSON.stringify(data),
});
```

### 4. Update Item
```typescript
const response = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
  body: JSON.stringify(data),
});
```

### 5. Delete Item
```typescript
const response = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### 6. Query Parameters
```typescript
const queryParams = new URLSearchParams({
  page: '1',
  limit: '10',
  search: 'john',
});

const response = await fetch(`${API_ENDPOINTS.users}?${queryParams}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### 7. Static Assets (Images, Files)
```typescript
// For profile pictures, clinic photos, etc.
<img src={`${BASE_URL}${user.profile_picture}`} alt="Profile" />
<img src={`${BASE_URL}/${photo}`} alt="Clinic" />
```

## Helper Functions

### buildEndpoint(endpoint, id)
Build an endpoint URL with optional ID:
```typescript
import { buildEndpoint, API_ENDPOINTS } from '@/config/api.config';

// Without ID
const url = buildEndpoint(API_ENDPOINTS.users);
// Result: http://localhost:8080/api/v1/users

// With ID
const url = buildEndpoint(API_ENDPOINTS.users, '123');
// Result: http://localhost:8080/api/v1/users/123
```

### buildQueryString(params)
Build a query string from an object:
```typescript
import { buildQueryString } from '@/config/api.config';

const params = {
  page: 1,
  limit: 10,
  search: 'john',
  status: 'active',
};

const queryString = buildQueryString(params);
// Result: "page=1&limit=10&search=john&status=active"

// Use it in fetch
const response = await fetch(`${API_ENDPOINTS.users}?${queryString}`);
```

## Environment Configuration

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Staging
```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

## Best Practices

1. **Always use API_ENDPOINTS**: Never hardcode URLs
   ```typescript
   // ❌ Bad
   fetch('http://localhost:8080/api/v1/users')
   
   // ✅ Good
   fetch(API_ENDPOINTS.users)
   ```

2. **Use BASE_URL for static assets**: For images, files, etc.
   ```typescript
   // ❌ Bad
   <img src={`http://localhost:8080${path}`} />
   
   // ✅ Good
   <img src={`${BASE_URL}${path}`} />
   ```

3. **Import only what you need**:
   ```typescript
   // If you only need endpoints
   import { API_ENDPOINTS } from '@/config/api.config';
   
   // If you need base URL too
   import { API_ENDPOINTS, BASE_URL } from '@/config/api.config';
   ```

4. **Use template literals for dynamic endpoints**:
   ```typescript
   // ✅ Good
   const url = `${API_ENDPOINTS.users}/${userId}`;
   ```

## Adding New Endpoints

To add a new endpoint, edit `backend/config/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // Add your new endpoint
  newResource: `${API_BASE_URL}/new-resource`,
};
```

Then use it in your components:
```typescript
import { API_ENDPOINTS } from '@/config/api.config';

const response = await fetch(API_ENDPOINTS.newResource);
```
