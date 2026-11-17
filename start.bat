@echo off
echo Starting The Fresh Crave Backend (port 8001)...
start "Fresh Crave Backend" cmd /c "node backend\server.js"

echo Starting The Fresh Crave Frontend (port 5173)...
cd frontend
start "Fresh Crave Frontend" cmd /c "npm run dev"

echo Both services launched! Opening browser...
timeout /t 3 >nul
start http://localhost:5173
