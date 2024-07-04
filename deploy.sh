#!/bin/bash

# Prompt for the public IP
read -p "Enter the public IP address: " PUBLIC_IP

# Define the directories
PROJECT_DIR=~/molecular-web-app
MOLE_TOOL_DIR=$PROJECT_DIR/mole-tool
BACKEND_DIR=$MOLE_TOOL_DIR/backend
NGINX_CONF=/etc/nginx/sites-available/default
ENV_FILE=$MOLE_TOOL_DIR/.env

# Update package lists and install dependencies
echo "Updating package lists..."
sudo apt-get update

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null
then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
else
    echo "Nginx is already installed"
fi

# Write the Nginx configuration template
echo "Writing Nginx configuration..."
sudo cp $MOLE_TOOL_DIR/nginx_default_template $NGINX_CONF

# Update the Nginx configuration with the public IP
echo "Updating Nginx configuration with public IP..."
sudo sed -i "s/__PUBLIC_IP__/$PUBLIC_IP/" $NGINX_CONF

# Update the React app environment variable
echo "Updating React app environment variable..."
echo "REACT_APP_PUBLIC_URL=http://$PUBLIC_IP" > $ENV_FILE

#handle permission for files problem
sudo usermod -aG ubuntu www-data
sudo chown -R ubuntu:ubuntu /home/ubuntu/molecular-web-app/mols_src/
sudo chmod -R 775 /home/ubuntu/molecular-web-app/mols_src/

# Restart Nginx to apply changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null
then
    echo "Installing Node.js and npm..."
    sudo apt-get install -y nodejs npm
else
    echo "Node.js and npm are already installed"
fi

# Install pm2 globally if not already installed
if ! command -v pm2 &> /dev/null
then
    echo "Installing pm2 globally..."
    sudo npm install -g pm2
else
    echo "pm2 is already installed"
fi

# Navigate to mole-tool and install dependencies
echo "Installing dependencies for the frontend..."
cd $MOLE_TOOL_DIR
npm install

# Navigate to backend and install dependencies
echo "Installing dependencies for the backend..."
cd $BACKEND_DIR
npm install

# Start the backend server with pm2
echo "Starting the backend server..."
pm2 start server.js --name mole-tool-backend

# Save pm2 process list and configure pm2 to start on boot
pm2 save
pm2 startup

# Navigate back to mole-tool and start the React app with pm2
echo "Starting the frontend server..."
cd $MOLE_TOOL_DIR
pm2 start npm --name "mole-tool-frontend" -- start


echo "Deployment script executed successfully."
