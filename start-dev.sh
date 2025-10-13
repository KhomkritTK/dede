#!/bin/bash

# Start DEDE E-Service Development Environment

echo "🚀 Starting DEDE E-Service Development Environment..."

# Check if we're in the right directory
if [ ! -f "dede/main.go" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of the project"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping all processes..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start the backend server
echo "📦 Starting Go backend server..."
cd dede
go run main.go &
BACKEND_PID=$!
cd ..

# Wait a moment for the backend to start
sleep 3

# Start the frontend development server
echo "🎨 Starting Next.js frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo ""
echo "🔧 Backend API: http://localhost:8080"
echo "🌐 Frontend: http://localhost:3001"
echo ""
echo "📝 Login credentials (you'll need to create these in the backend):"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for all background processes
wait