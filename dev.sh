#!/bin/bash

# If running on Railway/Render/Cloud with a dynamic PORT, run FastAPI backend directly
if [ -n "$PORT" ] || [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo "Starting Echoes of India FastAPI Backend on port ${PORT:-8000}..."
    cd backend
    exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

# Otherwise, Local Full-Stack Development Launcher
echo "=========================================================="
echo "  ECHOES OF INDIA: AI Historical Instrument Revival"
echo "=========================================================="

# Trap SIGINT to cleanly exit child processes
trap 'kill $(jobs -p)' EXIT

# 1. Start FastAPI Backend
echo "[1/2] Starting Python FastAPI Backend on http://localhost:8000 ..."
if [ -d "backend/venv" ]; then
    backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
else
    python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
fi

BACKEND_PID=$!
sleep 1

# 2. Start React Vite Frontend
echo "[2/2] Starting React Frontend on http://localhost:3000 ..."
cd frontend && npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🚀 Both services are running:"
echo "     Frontend: http://localhost:3000"
echo "     Backend:  http://localhost:8000 (API Docs: /docs)"
echo "=========================================================="
echo "Press Ctrl+C to stop all servers."

wait
