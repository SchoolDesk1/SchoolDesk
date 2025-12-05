@echo off
echo ======================================
echo   SCHOOLDESK - LAUNCH SCRIPT
echo   Super Admin Panel Ready!
echo ======================================
echo.

echo Starting Backend Server...
start "SchoolDesk Backend" cmd /k "cd /d %~dp0 && node server/index.js"
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Development Server...
start "SchoolDesk Frontend" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo ======================================
echo   SERVERS STARTED!
echo ======================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo SUPER ADMIN ACCESS:
echo URL: http://localhost:5173/secretsadmin
echo Key: SuperSecretAdmin2024!
echo.
echo ======================================
echo Press any key to open Super Admin...
pause > nul

start http://localhost:5173/secretsadmin

echo.
echo Super Admin panel opened in browser!
echo.
echo Keep this window open to see server status.
echo Close these terminals to stop the servers.
echo.
echo GOOD LUCK WITH YOUR LAUNCH! 🚀
echo.
pause
