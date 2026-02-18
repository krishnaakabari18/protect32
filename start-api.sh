#!/bin/bash

# Start API Server Script
# This script starts the API server on port 8080

echo "🚀 Starting Dentist Management API Server..."
echo ""

# Check if .env file exists
if [ ! -f "api/.env" ]; then
    echo "⚠️  .env file not found. Creating default .env file..."
    cat > api/.env << EOF
# Server Configuration
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=dentist
DB_PASSWORD=dentist@345

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
EOF
    echo "✅ .env file created"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "api/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd api && npm install && cd ..
    echo ""
fi

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8080 is already in use!"
    echo "   Killing existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start the server
echo "🎯 Starting API server on port 8080..."
cd api && npm start
