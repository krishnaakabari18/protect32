# CORS Troubleshooting Guide

## What is CORS?
CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers that blocks requests from one domain to another unless explicitly allowed by the server.

## Current CORS Configuration

### Allowed Origins
- `http://localhost:3000` (Next.js dev server)
- `http://localhost:3001` 
- `http://localhost:3002`
- `https://occupiable-milissa-ennuyante.ngrok-free.dev` (Current ngrok URL)
- `https://occupiable-milissa-ennuyante.ngrok-free.dev` (Legacy support)
- Environment variable: `FRONTEND_URL`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS, PATCH

### Allowed Headers
- Origin, X-Requested-With, Content-Type, Accept, Authorization
- ngrok-skip-browser-warning, X-HTTP-Method-Override

## Testing CORS

### 1. Test CORS Endpoint
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8080/cors-test
```

### 2. Test with Browser
Open browser console and run:
```javascript
fetch('http://localhost:8080/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS Test:', data))
.catch(error => console.error('CORS Error:', error));
```

## Common CORS Issues & Solutions

### 1. Origin Not Allowed
**Error:** `Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy`

**Solution:** Add your frontend URL to the allowed origins in `api/src/app.js`

### 2. Preflight Request Failed
**Error:** `Response to preflight request doesn't pass access control check`

**Solution:** Ensure OPTIONS method is handled (already implemented)

### 3. Credentials Not Allowed
**Error:** `The value of the 'Access-Control-Allow-Credentials' header is '' which must be 'true'`

**Solution:** Set `credentials: true` in CORS config (already implemented)

### 4. Headers Not Allowed
**Error:** `Request header 'authorization' is not allowed by Access-Control-Allow-Headers`

**Solution:** Add required headers to `allowedHeaders` array (already implemented)

## Environment Variables

Add to your `.env` file:
```env
FRONTEND_URL=http://localhost:3000
```

## Production Setup

For production, update the allowed origins:
```javascript
const allowedOrigins = [
  'https://your-production-domain.com',
  'https://www.your-production-domain.com',
  process.env.FRONTEND_URL
];
```

## Debugging Tips

1. **Check Browser Console:** Look for CORS error messages
2. **Check Network Tab:** Look for failed preflight (OPTIONS) requests
3. **Check Server Logs:** Look for "CORS blocked origin" messages
4. **Use CORS Test Endpoint:** `GET /cors-test` to verify CORS is working
5. **Verify Origin:** Make sure the request origin matches allowed origins exactly

## Quick Fixes

### Temporary Development Fix
For development only, you can temporarily allow all origins:
```javascript
origin: true, // WARNING: Only for development!
```

### Add New Origin
To add a new allowed origin, update the `allowedOrigins` array in `api/src/app.js`:
```javascript
const allowedOrigins = [
  // ... existing origins
  'https://your-new-domain.com'
];
```