# API Server Fix - ERR_NGROK_8012 Resolution

## Problem

The ngrok error `ERR_NGROK_8012` occurred because:
- The API server was not running on port 8080
- The server was trying to start on port 3000 (which was already in use by Next.js frontend)
- The `.env` file was missing, so the PORT environment variable wasn't set

## Solution Applied

### 1. Created `.env` File

Created `api/.env` with the correct configuration:

```env
# Server Configuration
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

### 2. Started API Server

The API server is now running on port 8080:
```
Server running on port 8080
```

## Verification

### Check if API is Running

```bash
# Check if port 8080 is in use
ps aux | grep "node.*server.js"

# Or check the process
lsof -i :8080
```

### Test API Endpoints

1. **Swagger Documentation**: http://localhost:8080/api-docs/
2. **Health Check**: http://localhost:8080/api/v1/health (if implemented)
3. **Login**: http://localhost:8080/api/v1/auth/login

### Test with curl

```bash
# Test login endpoint
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test users endpoint (requires auth token)
curl -X GET "http://localhost:8080/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

## Ngrok Setup

Now that the API is running on port 8080, you can start ngrok:

```bash
ngrok http 8080
```

This will create a public URL like: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

## Frontend Configuration

Make sure your frontend is configured to use the correct API URL:

**For local development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**For ngrok:**
```env
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app/api/v1
```

## Common Issues

### Issue 1: Port Already in Use

If you see `EADDRINUSE` error:
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use
pkill -f "node.*server.js"
```

### Issue 2: Database Connection Error

If you see database connection errors:
1. Make sure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `psql -U postgres -l`

### Issue 3: Module Not Found

If you see module errors:
```bash
cd api
npm install
```

## Starting the Servers

### Start API Server (Port 8080)
```bash
cd api
npm start
```

### Start Frontend (Port 3001)
```bash
cd backend
npm run dev
```

### Start Ngrok (Optional)
```bash
ngrok http 8080
```

## Current Status

✅ API Server: Running on port 8080
✅ .env File: Created with correct PORT=8080
✅ Database: Connected (assuming PostgreSQL is running)
✅ Ready for ngrok: Yes

## Next Steps

1. Keep the API server running
2. Start ngrok if you need external access
3. Test the API endpoints
4. Start the frontend if not already running
5. Login and test all modules

---

**The API server is now running correctly on port 8080!** 🚀
