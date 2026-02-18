#!/bin/bash

# Start All Servers Script
# This script starts both API (port 8080) and Frontend (port 3001)

echo "🚀 Starting Dentist Management System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "api/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating default .env file...${NC}"
    cat > api/.env << 'EOF'
# Server Configuration
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dentist_newdb
DB_USER=dentist
DB_PASS=dentist@345

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-in-production-dentist-management-system-2024
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Environment
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
fi

# Function to check if port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use. Killing existing process...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Check and install dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "api/node_modules" ]; then
    echo "Installing API dependencies..."
    cd api && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd backend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Kill existing processes
kill_port 8080
kill_port 3001
kill_port 3002

# Start API Server
echo -e "${BLUE}🎯 Starting API Server on port 8080...${NC}"
cd api
npm start > ../api.log 2>&1 &
API_PID=$!
cd ..
sleep 3

# Check if API started successfully
if check_port 8080; then
    echo -e "${GREEN}✅ API Server running on http://localhost:8080${NC}"
    echo -e "   Swagger UI: ${GREEN}http://localhost:8080/api-docs/${NC}"
else
    echo -e "${YELLOW}⚠️  API Server failed to start. Check api.log for details${NC}"
fi

echo ""

# Start Frontend Server
echo -e "${BLUE}🎯 Starting Frontend Server...${NC}"
cd backend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5

# Check which port frontend is using
if check_port 3001; then
    FRONTEND_PORT=3001
elif check_port 3002; then
    FRONTEND_PORT=3002
elif check_port 3000; then
    FRONTEND_PORT=3000
else
    FRONTEND_PORT="unknown"
fi

if [ "$FRONTEND_PORT" != "unknown" ]; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:${FRONTEND_PORT}${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend failed to start. Check frontend.log for details${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All servers started successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   API Server:    ${GREEN}http://localhost:8080${NC}"
echo -e "   Swagger UI:    ${GREEN}http://localhost:8080/api-docs/${NC}"
if [ "$FRONTEND_PORT" != "unknown" ]; then
    echo -e "   Frontend:      ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "   Login Page:    ${GREEN}http://localhost:${FRONTEND_PORT}/auth/boxed-signin${NC}"
fi
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   API logs:      tail -f api.log"
echo -e "   Frontend logs: tail -f frontend.log"
echo ""
echo -e "${BLUE}🔐 Default Login:${NC}"
echo -e "   Email:    admin@example.com"
echo -e "   Password: password123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $API_PID $FRONTEND_PID
