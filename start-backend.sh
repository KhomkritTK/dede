#!/bin/bash

# Kill any existing processes on port 8080
echo "Checking for processes on port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Wait a moment for processes to terminate
sleep 1

# Verify port is free
if lsof -i :8080 >/dev/null 2>&1; then
    echo "Error: Port 8080 is still in use"
    exit 1
fi

# Start the backend server
echo "Starting backend server..."
cd backend && go run main.go