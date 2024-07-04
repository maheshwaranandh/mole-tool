#!/bin/bash

# Define the directories
PROJECT_DIR=~/molecular-web-app
MOLE_TOOL_DIR=$PROJECT_DIR/mole-tool
BACKEND_DIR=$MOLE_TOOL_DIR/backend

cd $BACKEND_DIR

echo "Starting the backend server..."

pm2 start server.js --name mole-tool-backend

# Save pm2 process list and configure pm2 to start on boot
pm2 save
pm2 startup

# Navigate back to mole-tool and start the React app with pm2
echo "Starting the frontend server..."
cd $MOLE_TOOL_DIR
pm2 start npm --name "mole-tool-frontend" -- start

pm2 save
echo "Deployment script executed successfully."

