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

# Start Frontend via PM2
echo ""
echo "🚀 Starting Frontend with pm2 (process: sentraiq-frontend)..."

# Ensure .env.local exists with correct API URL
cd "$PROJECT_ROOT/frontend/sentraiq-dashboard"
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    echo "VITE_API_URL=http://49.50.99.89:$BACKEND_PORT" > .env.local
fi

# Use pm2 to manage the frontend
if ! command -v pm2 > /dev/null 2>&1; then
    echo "❌ pm2 is not installed or not in PATH"
    exit 1
fi

# Restart existing process or start it if not already running
if pm2 describe sentraiq-frontend > /dev/null 2>&1; then
    cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard && pm2 restart sentraiq-frontend
else
    cd /root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard && pm2 start ecosystem.config.cjs --only sentraiq-frontend
fi

echo "✅ Frontend started under pm2 (process: sentraiq-frontend)"
echo "   Use: pm2 status sentraiq-frontend"
echo "   Logs: pm2 logs sentraiq-frontend"
echo "   Dashboard: http://localhost:$FRONTEND_PORT"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SentraIQ services restarted successfully!"
echo ""
echo "📊 Service Status:"
echo "   Backend PID:  $BACKEND_PID (port $BACKEND_PORT)"
echo "   Frontend:     pm2 process 'sentraiq-frontend' (port $FRONTEND_PORT)"
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
echo "   kill $BACKEND_PID"
echo "   pm2 stop sentraiq-frontend"
echo "   or run: fuser -k $BACKEND_PORT/tcp $FRONTEND_PORT/tcp"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
