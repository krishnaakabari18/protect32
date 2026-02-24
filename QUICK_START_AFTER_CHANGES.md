# Quick Start After Code Changes

## ⚠️ Important: Server Must Be Restarted

After making any code changes to the API, you must restart the server for changes to take effect.

## How to Restart the API Server

### Method 1: Kill and Restart (Recommended)
```bash
# 1. Find the process
ps aux | grep "node src/server.js" | grep -v grep

# 2. Kill the process (replace PID with actual process ID)
kill <PID>

# 3. Start the server from api directory
cd api
node src/server.js
```

### Method 2: Using pkill
```bash
# Kill all node processes running server.js
pkill -f "node src/server.js"

# Start the server
cd api
node src/server.js
```

### Method 3: Using PM2 (if installed)
```bash
pm2 restart api
```

## Verify Server is Running

### Check Process
```bash
ps aux | grep "node src/server.js" | grep -v grep
```

### Check Port
```bash
# Should show port 8080 in use
netstat -tulpn | grep 8080
```

### Test API
```bash
# Should return provider data with absolute URLs
curl http://localhost:8080/api/v1/providers
```

## Current Status

✅ **API Server:** Running on port 8080
✅ **URL Conversion:** Working - all images return absolute URLs
✅ **Base URL:** https://abbey-stateliest-treva.ngrok-free.dev

## Quick Test

```bash
# Test that URLs are absolute (should see https:// in output)
curl http://localhost:8080/api/v1/providers | grep -o "https://[^\"]*" | head -5
```

Expected output:
```
https://abbey-stateliest-treva.ngrok-free.dev/uploads/provider/...
https://abbey-stateliest-treva.ngrok-free.dev/uploads/provider/...
https://abbey-stateliest-treva.ngrok-free.dev/uploads/provider/...
```

## Troubleshooting

### Server Won't Start - Port Already in Use
```bash
# Find what's using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>

# Or use different port in .env
PORT=8081
```

### Changes Not Reflected
1. Make sure you killed the old process
2. Make sure you're starting from the `api` directory
3. Check that .env file is in the `api` directory
4. Verify BASE_URL is set in .env

### URLs Still Relative
1. Restart the server (most common issue)
2. Check BASE_URL in api/.env
3. Clear browser cache
4. Check server logs for errors

## Environment Variables

Make sure these are set in `api/.env`:
```env
PORT=8080
BASE_URL=https://abbey-stateliest-treva.ngrok-free.dev
```

## Server Logs

To see server output:
```bash
# If running in foreground, you'll see logs in terminal

# If running in background, check logs
tail -f /tmp/api-server.log
```

---

**Remember:** Always restart the server after code changes!
