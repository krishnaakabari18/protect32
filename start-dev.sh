#!/bin/bash

# Dentist Management System - Development Startup Script

echo "🦷 Starting Dentist Management System..."
echo ""

# Check if API dependencies are installed
if [ ! -d "api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    cd api && npm install && cd ..
fi

# Check if UI dependencies are installed
if [ ! -d "protect/node_modules" ]; then
    echo "📦 Installing UI dependencies..."
    cd protect && npm install && cd ..
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start API in background
echo "▶️  Starting API server on http://localhost:8080"
cd api && npm run dev > ../api.log 2>&1 &
API_PID=$!
cd ..

# Wait for API to start
sleep 3

# Start UI in background
echo "▶️  Starting Admin UI on http://localhost:5173"
cd protect && npm run dev > ../ui.log 2>&1 &
UI_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "📍 API Server: http://localhost:8080"
echo "📍 API Docs: http://localhost:8080/api-docs"
echo "📍 Admin UI: http://localhost:5173"
echo ""
echo "📋 Test Credentials:"
echo "   Admin: admin@dentist.com / password123"
echo "   Provider: dr.smith@dentist.com / password123"
echo "   Patient: john.doe@email.com / password123"
echo ""
echo "📝 Logs:"
echo "   API: tail -f api.log"
echo "   UI: tail -f ui.log"
echo ""
echo "🛑 To stop: kill $API_PID $UI_PID"
echo "   Or press Ctrl+C and run: pkill -f 'node.*server.js' && pkill -f 'vite'"
echo ""

# Save PIDs to file for easy cleanup
echo "$API_PID" > .dev-pids
echo "$UI_PID" >> .dev-pids

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $API_PID $UI_PID 2>/dev/null; rm -f .dev-pids api.log ui.log; echo '✅ Services stopped'; exit 0" INT TERM

# Keep script running
wait
