@echo off
echo ========================================
echo Waste Management System Setup
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting the Waste Management System...
echo.
echo The application will be available at: http://localhost:3000
echo.
echo Default Admin Credentials:
echo Username: admin
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
