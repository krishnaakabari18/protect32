# Port Configuration

## ✅ Ports Changed Successfully!

### Current Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Frontend** | **3001** | **http://localhost:3001** | ✅ Running |
| **API** | 8080 | http://localhost:8080 | ✅ Running |

## 🎯 Access URLs

### Frontend (Port 3001)
- **Main URL**: http://localhost:3001
- **Login**: http://localhost:3001/auth/boxed-signin
- **Dashboard**: http://localhost:3001/ (after login)

### API (Port 8080)
- **API URL**: http://localhost:8080
- **Swagger**: http://localhost:8080/api-docs/

## 🔐 Login Credentials

```
Email:    admin@example.com
Password: password123
```

## 📋 Module URLs (Port 3001)

- Dashboard: http://localhost:3001/
- Users: http://localhost:3001/apps/contacts
- Patients: http://localhost:3001/management/patients
- Providers: http://localhost:3001/management/providers
- Appointments: http://localhost:3001/management/appointments
- Treatment Plans: http://localhost:3001/management/treatment-plans
- Prescriptions: http://localhost:3001/management/prescriptions
- Payments: http://localhost:3001/management/payments
- Documents: http://localhost:3001/management/documents
- Reviews: http://localhost:3001/management/reviews
- Notifications: http://localhost:3001/management/notifications

## 🔧 How to Change Port

### Frontend Port

Edit `backend/package.json`:

```json
"scripts": {
    "dev": "next dev -p 3001",  // Change 3001 to your desired port
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
}
```

Then restart the frontend:
```bash
# Stop current process
lsof -ti:3001 | xargs kill -9

# Start with new port
cd backend && npm run dev
```

### API Port

Edit `api/.env`:

```env
PORT=8080  # Change to your desired port
```

Then restart the API:
```bash
# Stop current process
lsof -ti:8080 | xargs kill -9

# Start with new port
cd api && npm start
```

## 🚀 Quick Start Commands

### Start Both Servers
```bash
# API Server (Port 8080)
cd api && npm start &

# Frontend (Port 3001)
cd backend && npm run dev &
```

### Or use the helper script
```bash
./start-all.sh
```

## 📊 Current Process Status

```bash
# Check API (Port 8080)
lsof -i :8080

# Check Frontend (Port 3001)
lsof -i :3001
```

## 🛑 Stop Servers

```bash
# Stop API
lsof -ti:8080 | xargs kill -9

# Stop Frontend
lsof -ti:3001 | xargs kill -9
```

## 💡 Port Options

### Common Port Choices

**Frontend:**
- 3000 (Next.js default)
- 3001 (Current)
- 3002
- 4000
- 5000

**API:**
- 8080 (Current)
- 8000
- 5000
- 3000

### Avoid These Ports
- 80 (HTTP - requires root)
- 443 (HTTPS - requires root)
- 22 (SSH)
- 3306 (MySQL)
- 5432 (PostgreSQL)

## ✅ Configuration Files Updated

1. ✅ `backend/package.json` - Frontend port set to 3001
2. ✅ `api/.env` - API port set to 8080
3. ✅ Both servers restarted

## 🎉 Ready to Use!

**Frontend**: http://localhost:3001
**Login**: http://localhost:3001/auth/boxed-signin

---

Last Updated: Now
Frontend Port: 3001
API Port: 8080
Status: ✅ All Systems Running
