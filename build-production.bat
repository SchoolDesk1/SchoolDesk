@echo off
REM SchoolDesk - Production Build & Deployment Script
REM Run this before deploying to production

echo.
echo ========================================
echo   SchoolDesk Production Build Script
echo ========================================
echo.

REM Step 1: Verify System
echo [1/4] Verifying system integrity...
cd server
node verify_system.js
if errorlevel 1 (
    echo ERROR: System verification failed!
    echo Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo [2/4] Building frontend for production...
cd ..\client
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Checking server dependencies...
cd ..\server
call npm install --production
if errorlevel 1 (
    echo ERROR: Server dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Running final checks...
if not exist "uploads" (
    mkdir uploads
    echo Created uploads directory
)

if not exist ".env" (
    echo WARNING: .env file not found!
    echo Creating default .env file...
    echo JWT_SECRET=CHANGE_THIS_IN_PRODUCTION_%RANDOM%%RANDOM% > .env
    echo PORT=5000 >> .env
    echo NOTE: Please update JWT_SECRET in .env file!
)

echo.
echo ========================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your production build is ready in: client\dist
echo Server is ready to run from: server\
echo.
echo To start the production server:
echo   cd server
echo   node index.js
echo.
echo Or visit LAUNCH_GUIDE.md for deployment options
echo.
pause
