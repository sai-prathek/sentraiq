#!/bin/bash

# SentraIQ Restart Script
# Kills processes on ports 8080 (backend) and 8081 (frontend) and restarts both services

set -e

PROJECT_ROOT="/root/sai/SentraIQ-main/SentraIQ-main"
BACKEND_PORT=8080
FRONTEND_PORT=8081

echo "🔄 Restarting SentraIQ services..."

# Function to kill process on a port
kill_port() {
    local port=$1
    local service=$2
    
    echo "🔍 Checking for processes on port $port ($service)..."
    
    # Try to find and kill process using fuser
    if fuser -k ${port}/tcp 2>/dev/null; then
        echo "✅ Killed process on port $port"
        sleep 1
    else
        echo "ℹ️  No process found on port $port"
    fi
    
    # Also try lsof as fallback
    if command -v lsof > /dev/null 2>&1; then
        local pid=$(lsof -ti:${port} 2>/dev/null || true)
        if [ ! -z "$pid" ]; then
            echo "🔍 Found process $pid via lsof, killing..."
            kill -9 $pid 2>/dev/null || true
            sleep 1
        fi
    fi
}

# Kill existing processes
echo ""
echo "🛑 Stopping existing services..."
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"

# Wait a moment for ports to be released
sleep 2

# Start Backend
echo ""
echo "🚀 Starting Backend on port $BACKEND_PORT..."
cd "$PROJECT_ROOT"

# Initialize conda for bash script
if [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "/opt/conda/etc/profile.d/conda.sh" ]; then
    source "/opt/conda/etc/profile.d/conda.sh"
else
    # Try to find conda base path
    CONDA_BASE=$(conda info --base 2>/dev/null || echo "")
    if [ ! -z "$CONDA_BASE" ] && [ -f "$CONDA_BASE/etc/profile.d/conda.sh" ]; then
        source "$CONDA_BASE/etc/profile.d/conda.sh"
    else
        echo "❌ Could not find conda initialization script"
        exit 1
    fi
fi

# Check if conda environment exists
if ! conda env list | grep -q "^sentra "; then
    echo "❌ Conda environment 'sentra' not found"
    echo "   Please create it first: conda create -n sentra python=3.9"
    exit 1
fi

# Activate conda environment and start backend
conda activate sentra

# Start backend in background
nohup uvicorn backend.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: $PROJECT_ROOT/backend.log"
echo "   API: http://localhost:$BACKEND_PORT"
echo "   Docs: http://localhost:$BACKEND_PORT/docs"

# Start Frontend
echo ""
echo "🚀 Starting Frontend on port $FRONTEND_PORT..."
cd "$PROJECT_ROOT/frontend/sentraiq-dashboard"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Run 'npm install' first."
fi

# Ensure .env.local exists with correct API URL
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    echo "VITE_API_URL=http://49.50.99.89:$BACKEND_PORT" > .env.local
fi

# Start frontend in background
nohup npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: $PROJECT_ROOT/frontend/sentraiq-dashboard/frontend.log"
echo "   Dashboard: http://localhost:$FRONTEND_PORT"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SentraIQ services restarted successfully!"
echo ""
echo "📊 Service Status:"
echo "   Backend PID:  $BACKEND_PID (port $BACKEND_PORT)"
echo "   Frontend PID: $FRONTEND_PID (port $FRONTEND_PORT)"
echo ""
echo "🔗 URLs:"
echo "   API:       http://localhost:$BACKEND_PORT"
echo "   API Docs:  http://localhost:$BACKEND_PORT/docs"
echo "   Dashboard: http://localhost:$FRONTEND_PORT"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f $PROJECT_ROOT/backend.log"
echo "   Frontend: tail -f $PROJECT_ROOT/frontend/sentraiq-dashboard/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: fuser -k $BACKEND_PORT/tcp $FRONTEND_PORT/tcp"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
