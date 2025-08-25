#!/bin/bash

echo "Starting AnimeTracker Application..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Please start MongoDB first."
    echo "On macOS: brew services start mongodb/brew/mongodb-community"
    echo "On Ubuntu: sudo systemctl start mongod"
    echo "On Windows: net start MongoDB"
    exit 1
fi

# Start the backend server
echo "Starting backend server..."
npm run server &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

echo "Backend server started with PID: $BACKEND_PID"
echo ""
echo "🚀 AnimeTracker is now running!"
echo ""
echo "📱 Landing Page: http://localhost:3000"
echo "🔧 API Server: http://localhost:5000"
echo "💾 MongoDB: mongodb://localhost:27017/anime_tracker"
echo ""
echo "To stop the application, press Ctrl+C"
echo ""

# Keep the script running
wait $BACKEND_PID