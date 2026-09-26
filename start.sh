#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# AgroGuardian AI — Quick Start Script
# Usage: chmod +x start.sh && ./start.sh
# ─────────────────────────────────────────────────────────────────────

echo ""
echo "🌱 AgroGuardian AI — Starting..."
echo ""

# ── Backend ──────────────────────────────────────────────────────────
echo "📦 Starting Flask backend..."
cd backend

if [ ! -d "venv" ]; then
  echo "   Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

python app.py &
BACKEND_PID=$!
echo "   ✅ Backend running at http://localhost:5000 (PID $BACKEND_PID)"

cd ..

# ── Frontend ─────────────────────────────────────────────────────────
echo ""
echo "⚛️  Starting React frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "   Installing npm packages..."
  npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "   ✅ Frontend running at http://localhost:5173 (PID $FRONTEND_PID)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 AgroGuardian AI is running!"
echo "   Open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and clean up on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT
wait
