#!/bin/bash

# Stop development servers
echo "Stopping development servers..."

# Kill React dev server on port 3000
REACT_PID=$(lsof -ti :3000)
if [ ! -z "$REACT_PID" ]; then
    echo "Stopping React dev server (PID: $REACT_PID)"
    kill -9 $REACT_PID
fi

# Kill any remaining node processes related to this project
pkill -f "react-scripts start"
pkill -f "npm start"

echo "Development servers stopped."
