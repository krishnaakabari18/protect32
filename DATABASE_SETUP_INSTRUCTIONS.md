# Database Setup Instructions

## Issue: Password Authentication Failed

The database user `dentist` either doesn't exist or has a different password than what's in the `.env` file.

## Solution Options

### Option 1: Create the Database User (Recommended)

1. Open PostgreSQL command line as superuser (postgres):
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

2. Create the dentist user and database:
```sql
-- Create user
CREATE USER dentist WITH PASSWORD 'dentist@345';

-- Create database
CREATE DATABASE dentist_newdb OWNER dentist;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dentist_newdb TO dentist;

-- Connect to the database
\c dentist_newdb

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dentist;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dentist;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit
\q
```

3. Then run the migration:
```bash
cd api
node run-migration.js
```

### Option 2: Use Existing PostgreSQL User

If you already have a PostgreSQL user (like `postgres`), update the `.env` file:

1. Open `api/.env`
2. Update these lines:
```env
DB_USER=postgres
DB_PASS=your_postgres_password
```

3. Then run the migration:
```bash
cd api
node run-migration.js
```

### Option 3: Find Your PostgreSQL Password

If you forgot your PostgreSQL password:

1. Locate `pg_hba.conf` file:
   - Usually at: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`

2. Temporarily change authentication method:
   - Find lines with `md5` or `scram-sha-256`
   - Change to `trust` (temporarily!)
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   # IPv6 local connections:
   host    all             all             ::1/128                 trust
   ```

3. Restart PostgreSQL service:
   - Open Services (services.msc)
   - Find "postgresql-x64-18"
   - Right-click → Restart

4. Connect without password and reset:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```
```sql
ALTER USER postgres PASSWORD 'new_password';
ALTER USER dentist PASSWORD 'dentist@345';
```

5. Change `pg_hba.conf` back to `scram-sha-256` or `md5`

6. Restart PostgreSQL service again

## After Database Setup

Once you have the correct credentials:

### 1. Run the Procedures Migration
```bash
cd api
node run-migration.js
```

Expected output:
```
🔌 Connected to database
📄 Running migration: create-procedures-categories-table.sql
✅ Migration completed successfully!

📊 Procedure counts by category:
   Adjunctive: 5 procedures
   Diagnostic & Preventive: 16 procedures
   Endodontic: 9 procedures
   ...

✨ Total procedures: 90+
```

### 2. Start the API Server
```bash
cd api
npm start
```

### 3. Test the Frontend
Open: http://localhost:3000/management/provider-fees

## Troubleshooting

### Error: "database dentist_newdb does not exist"
Create the database first:
```sql
CREATE DATABASE dentist_newdb;
```

### Error: "extension uuid-ossp does not exist"
Enable the extension:
```sql
\c dentist_newdb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied for schema public"
Grant permissions:
```sql
\c dentist_newdb
GRANT ALL ON SCHEMA public TO dentist;
```

## Quick Test

After setup, test the connection:
```bash
cd api
node test-db-password.js
```

Should show:
```
✅ SUCCESS with password: "dentist@345"
```

## Need Help?

If you're still having issues:
1. Check PostgreSQL is running (Services → postgresql-x64-18)
2. Verify the database exists: `\l` in psql
3. Verify the user exists: `\du` in psql
4. Check the .env file has correct credentials
5. Try connecting with pgAdmin to verify credentials work
