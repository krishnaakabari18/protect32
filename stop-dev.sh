#!/bin/bash

# Stop development servers

echo "🛑 Stopping Dentist Management System services..."

# Kill processes from PID file if it exists
if [ -f ".dev-pids" ]; then
    while read pid; do
        kill $pid 2>/dev/null && echo "   Stopped process $pid"
    done < .dev-pids
    rm -f .dev-pids
fi

# Fallback: kill by process name
pkill -f 'node.*server.js' 2>/dev/null && echo "   Stopped API server"
pkill -f 'vite' 2>/dev/null && echo "   Stopped UI server"
pkill -f 'nodemon' 2>/dev/null && echo "   Stopped nodemon"

# Clean up log files
rm -f api.log ui.log

echo "✅ All services stopped"
