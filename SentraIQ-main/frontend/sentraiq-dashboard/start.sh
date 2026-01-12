#!/bin/bash

# SentraIQ Dashboard Startup Script

echo "🚀 Starting SentraIQ Dashboard..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend API not responding at http://localhost:8000"
    echo "   Please start the backend first: cd ../.. && ./scripts/run.sh"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🌐 Starting development server on http://localhost:3000"
echo "📡 API proxy configured for http://localhost:8000"
echo ""

npm run dev
