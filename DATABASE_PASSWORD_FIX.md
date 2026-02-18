# Database Password Fix

## Problem

The error `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` and `password authentication failed for user "postgres"` indicates that the PostgreSQL password in the `.env` file is incorrect.

## Current Configuration

The `.env` file currently has:
```env
DB_PASS="postgres"
```

But this password is not correct for your PostgreSQL installation.

## Solution: Find the Correct PostgreSQL Password

### Option 1: Check if you know the password

If you set a password when installing PostgreSQL, use that password.

### Option 2: Reset PostgreSQL Password

If you don't remember the password, you can reset it:

#### For Linux/Ubuntu:

1. **Switch to postgres user:**
   ```bash
   sudo -i -u postgres
   ```

2. **Open PostgreSQL prompt:**
   ```bash
   psql
   ```

3. **Reset the password:**
   ```sql
   ALTER USER postgres PASSWORD 'your_new_password';
   \q
   ```

4. **Exit postgres user:**
   ```bash
   exit
   ```

#### For macOS:

1. **Open PostgreSQL prompt:**
   ```bash
   psql postgres
   ```

2. **Reset the password:**
   ```sql
   ALTER USER postgres PASSWORD 'your_new_password';
   \q
   ```

### Option 3: Use peer authentication (Linux only)

If you're on Linux, you can configure PostgreSQL to use peer authentication for local connections:

1. **Edit pg_hba.conf:**
   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```

2. **Find the line:**
   ```
   local   all             postgres                                peer
   ```

3. **Change it to:**
   ```
   local   all             postgres                                trust
   ```

4. **Restart PostgreSQL:**
   ```bash
   sudo systemctl restart postgresql
   ```

5. **Now you can connect without a password:**
   Update `.env`:
   ```env
   DB_PASS=
   ```

### Option 4: Check existing configuration

Check if there's another configuration file with the correct password:

```bash
# Check for .env.local
cat api/.env.local

# Check for other env files
ls -la api/.env*

# Check database config
cat api/database/config.ts
```

## Update the .env File

Once you know the correct password, update `api/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=postgres
DB_PASS=YOUR_ACTUAL_PASSWORD_HERE
```

**Important:** Remove the quotes around the password:
- ❌ Wrong: `DB_PASS="postgres"`
- ✅ Correct: `DB_PASS=postgres`
- ✅ Correct: `DB_PASS=my_secure_password`

## Test the Connection

After updating the password, test the connection:

```bash
node api/test-db-connection.js
```

You should see:
```
✅ Database connected successfully!
Current time from DB: 2024-XX-XX XX:XX:XX
```

## Restart the API Server

After fixing the password:

1. **Stop the current server** (if running)
2. **Start it again:**
   ```bash
   cd api
   npm start
   ```

3. **Check the output:**
   You should see:
   ```
   Server running on port 8080
   Database connected successfully
   ```

## Common PostgreSQL Default Passwords

Try these common default passwords:
- `postgres`
- `password`
- `admin`
- `root`
- Empty password (leave `DB_PASS=` blank)

## Verify Database Exists

Make sure the database exists:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# List databases
\l

# You should see 'dentist_newdb' in the list
# If not, create it:
CREATE DATABASE dentist_newdb;

# Exit
\q
```

## Final Configuration

Your final `api/.env` should look like this:

```env
# Server Configuration
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=postgres
DB_PASS=your_actual_password

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

## Test Login After Fix

Once the database connection is working:

1. **Test the API:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}'
   ```

2. **Expected response:**
   ```json
   {
     "message": "Login successful",
     "data": {
       "user": {...},
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

## Need Help?

If you're still having issues:

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check PostgreSQL logs:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*-main.log
   ```

3. Verify the database exists and has tables:
   ```bash
   sudo -u postgres psql dentist_newdb -c "\dt"
   ```

---

**Once you find the correct password, update the `.env` file and restart the API server!**
