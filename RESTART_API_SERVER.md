# Restart API Server - Patient Education Updates

## Why Restart?

The API server needs to be restarted to load the new changes:
- Image upload routes with multer middleware
- Updated controller with FormData handling
- New image upload utility

## How to Restart

### Option 1: Using Terminal (Recommended)

1. **Find the running process**:
```bash
ps aux | grep "node.*server.js"
```

2. **Kill the process**:
```bash
kill <PID>
# Replace <PID> with the process ID from step 1
```

3. **Start the server again**:
```bash
cd api
node src/server.js
```

### Option 2: Using Ctrl+C

1. Go to the terminal where API server is running
2. Press `Ctrl+C` to stop
3. Run again:
```bash
node src/server.js
```

### Option 3: Using the start script

```bash
cd api
./start-api.sh
```

## Verify Server is Running

After restart, check:

```bash
# Check if process is running
ps aux | grep "node.*server.js"

# Should see output like:
# gstv  12345  0.0  0.4  node src/server.js
```

## Test the New Endpoints

Once restarted, test the image upload:

```bash
# Get your auth token first (from localStorage after login)
TOKEN="your_token_here"

# Test create with image
curl -X POST http://localhost:8080/api/v1/patient-education \
  -H "Authorization: Bearer $TOKEN" \
  -H "ngrok-skip-browser-warning: true" \
  -F "title=Test with Image" \
  -F "category=Testing" \
  -F "content=<p>Test content</p>" \
  -F "status=Active" \
  -F "feature_image=@/path/to/image.jpg"
```

## Frontend Cache Clear

If you see "Route not found" in the frontend:

```bash
cd backend
rm -rf .next
# Then restart the dev server
npm run dev
```

## Verification Checklist

After restart, verify:
- [ ] API server is running (check process)
- [ ] Server responds to health check
- [ ] Patient education endpoints work
- [ ] Image upload accepts files
- [ ] Images are saved to uploads folder
- [ ] Frontend can access the module
- [ ] No errors in server logs

## Current Server Status

To check current status:

```bash
# Check if running
ps aux | grep "node.*server.js" | grep -v grep

# Check port 8080 is listening
netstat -tuln | grep 8080

# Or using lsof
lsof -i :8080
```

## Troubleshooting

### Issue: Port 8080 already in use
```bash
# Find what's using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Start server again
cd api && node src/server.js
```

### Issue: Module not found errors
```bash
# Install dependencies
cd api
npm install multer
```

### Issue: Permission denied on uploads folder
```bash
cd api
chmod -R 755 uploads/
```

## Quick Restart Command

```bash
# One-liner to restart
pkill -f "node.*server.js" && cd api && node src/server.js &
```

---

**After restart, the Patient Education module with rich text editor and image upload will be fully functional!**
