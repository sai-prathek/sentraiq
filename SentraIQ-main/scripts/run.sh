#!/bin/bash

# SentralQ Run Script

echo "🚀 Starting SentralQ Hybrid Evidence Lakehouse..."

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Please run ./scripts/setup.sh first"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
fi

# Run the application
echo "🌐 Starting FastAPI server on http://49.50.99.89:8080"
echo "📊 Dashboard: http://49.50.99.89:8080"
echo "📚 API Docs: http://49.50.99.89:8080/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8080
