#!/bin/bash

# Prompt for the public IP
read -p "Enter the public IP address: " PUBLIC_IP

# Define the directories
PROJECT_DIR=~
MOLE_TOOL_DIR=$PROJECT_DIR/mole-tool
BACKEND_DIR=$MOLE_TOOL_DIR/backend
NGINX_CONF=/etc/nginx/sites-available/default
ENV_FILE=$MOLE_TOOL_DIR/.env

# Write the Nginx configuration template
echo "Writing Nginx configuration..."
sudo cp $MOLE_TOOL_DIR/nginx_default_template $NGINX_CONF

# Update the Nginx configuration with the public IP
echo "Updating Nginx configuration with public IP..."
sudo sed -i "s/__PUBLIC_IP__/$PUBLIC_IP/" $NGINX_CONF

# Update the React app environment variable
echo "Updating React app environment variable..."
echo "REACT_APP_PUBLIC_URL=http://$PUBLIC_IP" > $ENV_FILE

# Restart Nginx to apply changes
echo "Restarting Nginx..."
sudo systemctl restart nginx


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