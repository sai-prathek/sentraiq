#!/bin/bash

# Script to start SentraIQ frontend with PM2
# This ensures the frontend runs persistently even after closing the terminal

cd "$(dirname "$0")"

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Check if the app is already running
if pm2 list | grep -q "sentraiq-frontend"; then
    echo "Frontend is already running. Restarting..."
    pm2 restart sentraiq-frontend
else
    echo "Starting frontend with PM2..."
    pm2 start ecosystem.config.cjs
fi

# Save PM2 process list to ensure it starts on system reboot
pm2 save

# Setup PM2 to start on system boot (optional - uncomment if needed)
# pm2 startup

echo ""
echo "Frontend is now running with PM2!"
echo "Access it at: http://$(hostname -I | awk '{print $1}'):8081"
echo ""
echo "Useful PM2 commands:"
echo "  npm run pm2:status  - Check status"
echo "  npm run pm2:logs    - View logs"
echo "  npm run pm2:stop    - Stop the frontend"
echo "  npm run pm2:restart - Restart the frontend"
echo "  npm run pm2:delete  - Remove from PM2"
