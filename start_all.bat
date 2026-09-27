@echo off
title STEM Intellect - Dual Server Launcher
echo ===============================================================
echo 🎓 Starting STEM Intellect (Python Backend + Next.js Web App)
echo ===============================================================

echo [1/2] Launching Python Symbolic Math Backend (Port 8000)...
start "STEM Intellect - Python Backend" cmd /k "python run_python_backend.py"

echo [2/2] Launching Next.js Web Application (Port 3000)...
start "STEM Intellect - Web App" cmd /k "npm run dev"

echo.
echo Both servers started!
echo Python Math Engine:  http://127.0.0.1:8000
echo Web App:             http://localhost:3000
echo.
timeout /t 3 >nul
start http://localhost:3000
