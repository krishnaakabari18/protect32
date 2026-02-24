# Login Page Troubleshooting Guide

## Issue: Login Page Not Loading

Based on your logs, the server is running but you're having trouble accessing the login page.

## ✅ Server Status

Your server IS running correctly:
```
✓ Ready in 1755ms
✓ Compiled /middleware in 207ms (72 modules)
✓ Compiled / in 6s (942 modules)
GET / 200 in 6883ms
```

## 🎯 How to Access the Login Page

### Direct URL
**Login Page**: http://localhost:3001/auth/boxed-signin

### Step-by-Step

1. **Open your browser** (Chrome, Firefox, Edge, etc.)

2. **Type the URL**: `http://localhost:3001/auth/boxed-signin`

3. **Press Enter**

4. **You should see**: The login form with email and password fields

## 🔍 Troubleshooting Steps

### Step 1: Clear Browser Cache

1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Try accessing the login page again

### Step 2: Try Incognito/Private Mode

1. Open a new incognito/private window
2. Go to: http://localhost:3001/auth/boxed-signin
3. This bypasses cache and cookies

### Step 3: Check Browser Console

1. Open browser (go to http://localhost:3001/auth/boxed-signin)
2. Press `F12` or right-click → "Inspect"
3. Click on "Console" tab
4. Look for any red error messages
5. Share those errors if you see any

### Step 4: Check Network Tab

1. Open browser DevTools (`F12`)
2. Click "Network" tab
3. Refresh the page (`F5`)
4. Look for failed requests (red status codes)
5. Check if any requests are pending or failed

### Step 5: Verify Server is Running

```bash
# Check if port 3001 is listening
lsof -i :3001

# Or
ss -tlnp | grep 3001

# You should see output showing the process
```

### Step 6: Test with curl

```bash
# Test if the server responds
curl -I http://localhost:3001/auth/boxed-signin

# You should see HTTP/1.1 200 OK
```

### Step 7: Check Firewall

```bash
# Check if firewall is blocking
sudo ufw status

# If active, allow port 3001
sudo ufw allow 3001
```

## 🌐 Different Ways to Access

### Option 1: Direct Login URL
```
http://localhost:3001/auth/boxed-signin
```

### Option 2: Root URL (will redirect to login if not authenticated)
```
http://localhost:3001/
```

### Option 3: Using IP Address
```
http://127.0.0.1:3001/auth/boxed-signin
```

## 📊 What Should You See?

When the login page loads correctly, you should see:

1. **Background**: Gradient background with decorative images
2. **Login Form**: 
   - "Sign in" heading
   - Email input field
   - Password input field
   - "Sign in" button
3. **Styling**: Modern, clean design with purple/blue gradient

## 🔐 Test Login

Once you can see the login page:

1. **Email**: `admin@example.com`
2. **Password**: `password123`
3. Click "Sign in"
4. You should be redirected to the dashboard

## 🐛 Common Issues

### Issue 1: "This site can't be reached"
**Solution**: Server is not running
```bash
cd backend
npm run dev
```

### Issue 2: Blank white page
**Solution**: JavaScript error or build issue
```bash
cd backend
rm -rf .next
npm run dev
```

### Issue 3: "Cannot GET /auth/boxed-signin"
**Solution**: Route not found
```bash
# Check if the file exists
ls -la backend/app/\(auth\)/auth/boxed-signin/page.tsx
```

### Issue 4: Styles not loading
**Solution**: CSS compilation issue
```bash
cd backend
rm -rf .next
npm install
npm run dev
```

### Issue 5: Infinite redirect loop
**Solution**: Cookie/middleware issue
- Clear browser cookies
- Open incognito mode
- Try again

## 🧪 Quick Test Commands

### Test 1: Check if server is responding
```bash
curl http://localhost:3001/auth/boxed-signin
```

### Test 2: Check server logs
```bash
# In the terminal where npm run dev is running
# You should see:
# GET /auth/boxed-signin 200 in XXXms
```

### Test 3: Test API connection
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 📝 What to Check in Browser

### 1. URL Bar
Make sure you're typing:
```
http://localhost:3001/auth/boxed-signin
```

NOT:
- ~~http://localhost:3000~~ (wrong port)
- ~~http://localhost:3001~~ (missing /auth/boxed-signin)
- ~~https://localhost:3001~~ (should be http, not https)

### 2. Browser Console (F12)
Look for errors like:
- "Failed to fetch"
- "Network error"
- "404 Not Found"
- "500 Internal Server Error"

### 3. Network Tab (F12)
Check if requests are:
- ✅ Status 200 (OK)
- ❌ Status 404 (Not Found)
- ❌ Status 500 (Server Error)
- ⏳ Pending (stuck loading)

## 🎯 Expected Behavior

### When you access http://localhost:3001/

1. Middleware checks for auth_token cookie
2. No token found
3. Redirects to `/auth/boxed-signin`
4. Login page loads

### When you access http://localhost:3001/auth/boxed-signin

1. Login page loads directly
2. No redirect needed
3. Form is displayed

## 💡 Quick Fix

If nothing works, try this complete reset:

```bash
# Stop all servers
pkill -f "next dev"
pkill -f "node.*server.js"

# Clear Next.js cache
cd backend
rm -rf .next
rm -rf node_modules/.cache

# Restart
npm run dev
```

Then access: http://localhost:3001/auth/boxed-signin

## 📞 Still Not Working?

If the login page still doesn't load:

1. **Share the browser console errors** (F12 → Console tab)
2. **Share the network tab** (F12 → Network tab → screenshot)
3. **Share the terminal output** where `npm run dev` is running
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Check if you can access** http://localhost:3001 (root URL)

---

**Most Common Solution**: Just type the full URL in your browser:
```
http://localhost:3001/auth/boxed-signin
```

And press Enter! 🚀
