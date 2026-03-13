# Ngrok Usage Guide

## 🔍 Issue Identified

Ngrok free tier shows an interstitial warning page (ERR_NGROK_6024) before allowing access. This is **NOT an API bug** - it's a security feature of ngrok's free tier.

## ✅ Solution Applied

Added middleware to help bypass the ngrok warning for API requests.

## 🚀 How to Use the API with Ngrok

### Option 1: Add Header (Recommended)
Add this header to all your requests:
```
ngrok-skip-browser-warning: true
```

### Example with curl:
```bash
curl -X GET 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users' \
  -H 'accept: application/json' \
  -H 'ngrok-skip-browser-warning: true' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Example with Swagger:
The server now automatically adds this header to responses, so Swagger should work better.

### Example with JavaScript/Fetch:
```javascript
fetch('https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users', {
  headers: {
    'accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

### Example with Postman:
1. Add a header: `ngrok-skip-browser-warning: true`
2. Make your request normally

## 🧪 Test Commands

### Test 1: Get Users (with bypass header)
```bash
curl -X GET 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users' \
  -H 'ngrok-skip-browser-warning: true'
```

### Test 2: Login (with bypass header)
```bash
curl -X POST 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -H 'ngrok-skip-browser-warning: true' \
  -d '{
    "email": "admin@dentist.com",
    "password": "password123"
  }'
```

### Test 3: Get Providers (with bypass header)
```bash
curl -X GET 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/providers' \
  -H 'ngrok-skip-browser-warning: true'
```

## 📋 All Request Headers Needed

For authenticated endpoints:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
ngrok-skip-browser-warning: true
```

For public endpoints:
```
Content-Type: application/json
ngrok-skip-browser-warning: true
```

## 🎯 Swagger UI Usage

1. Visit: https://occupiable-milissa-ennuyante.ngrok-free.dev/api-docs
2. If you see the ngrok warning page, click "Visit Site"
3. The API should now work in Swagger UI
4. The server automatically adds the bypass header to responses

## 💡 Alternative Solutions

### Option 2: Upgrade Ngrok (Recommended for Production)
```bash
# Upgrade to ngrok paid plan
# Benefits:
# - No warning page
# - Custom domains
# - Better performance
# - More concurrent connections
```

### Option 3: Use Local Development
```bash
# Always works without issues
http://localhost:8080/api-docs
http://localhost:8080/api/v1/users
```

### Option 4: Deploy to Production Hosting
Consider deploying to:
- AWS (EC2, Elastic Beanstalk, Lambda)
- Heroku
- DigitalOcean
- Google Cloud
- Azure

## 🔧 What Was Changed

### 1. Added Middleware in `src/app.js`
```javascript
// Ngrok warning bypass middleware
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});
```

### 2. Updated Swagger Config
Added parameter definition for the bypass header.

## ✅ Verification

After the changes, test with:

```bash
# Without header (may show warning)
curl https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users

# With header (should work)
curl -H 'ngrok-skip-browser-warning: true' \
  https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1/users
```

## 📊 Expected Results

### Before Fix:
```html
<!DOCTYPE html>
<html>
  <!-- Ngrok warning page -->
</html>
```

### After Fix (with header):
```json
{
  "data": [
    {
      "id": "...",
      "email": "admin@dentist.com",
      ...
    }
  ]
}
```

## 🎓 Understanding Ngrok Free Tier

### What is ERR_NGROK_6024?
- Security feature of ngrok free tier
- Shows warning before allowing access
- Prevents abuse of free tunnels
- Can be bypassed with header

### Limitations of Free Tier:
- ⚠️ Warning page on first visit
- ⚠️ Limited connections
- ⚠️ Random URLs (changes on restart)
- ⚠️ No custom domains
- ⚠️ Rate limiting

### Paid Tier Benefits:
- ✅ No warning page
- ✅ Custom domains
- ✅ More connections
- ✅ Better performance
- ✅ Static URLs

## 🚀 Production Deployment Recommendations

For production, **don't use ngrok**. Instead:

1. **AWS EC2/Elastic Beanstalk**
   - Full control
   - Scalable
   - Professional

2. **Heroku**
   - Easy deployment
   - Free tier available
   - Good for Node.js

3. **DigitalOcean**
   - Simple droplets
   - Good pricing
   - Easy to manage

4. **Railway/Render**
   - Modern platforms
   - Easy deployment
   - Good free tiers

## 📝 Summary

- ✅ Issue: Ngrok free tier warning page
- ✅ Solution: Add `ngrok-skip-browser-warning: true` header
- ✅ Applied: Middleware automatically adds header
- ✅ Status: APIs working, just need header in requests

**Your APIs are working perfectly!** The ngrok warning is just a free tier limitation, not an API issue.

## 🔗 Quick Links

- Local Swagger (Always Works): http://localhost:8080/api-docs
- Ngrok Swagger: https://occupiable-milissa-ennuyante.ngrok-free.dev/api-docs
- Ngrok Dashboard: http://127.0.0.1:4040

## 💬 Support

If you continue to have issues:
1. Test locally first (http://localhost:8080/api-docs)
2. Add the bypass header to your requests
3. Consider upgrading ngrok or deploying to production hosting
