#!/bin/bash

# Script to view PM2 logs for SentraIQ frontend

cd "$(dirname "$0")"

echo "=== PM2 Frontend Logs Viewer ==="
echo ""
echo "Choose an option:"
echo "1) View logs in real-time (streaming)"
echo "2) View last 50 lines (no streaming)"
echo "3) View error logs only"
echo "4) View output logs only"
echo "5) View log files directly"
echo "6) Check PM2 status"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo "Streaming logs (Ctrl+C to exit)..."
        pm2 logs sentraiq-frontend
        ;;
    2)
        echo "Last 50 lines:"
        pm2 logs sentraiq-frontend --lines 50 --nostream
        ;;
    3)
        echo "Error logs:"
        pm2 logs sentraiq-frontend --err --lines 50 --nostream
        ;;
    4)
        echo "Output logs:"
        pm2 logs sentraiq-frontend --out --lines 50 --nostream
        ;;
    5)
        echo "Log files location:"
        echo "  Output: $PWD/logs/pm2-out.log"
        echo "  Errors: $PWD/logs/pm2-error.log"
        echo ""
        echo "Viewing log files..."
        tail -50 logs/pm2-*.log
        ;;
    6)
        pm2 status
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
