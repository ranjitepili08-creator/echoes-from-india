#!/bin/bash

# Echoes of India - Full-Stack Local Launcher

echo "=========================================================="
echo "  ECHOES OF INDIA: AI Historical Instrument Revival"
echo "  AI/ML Program — Masai School × IIT Patna"
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
