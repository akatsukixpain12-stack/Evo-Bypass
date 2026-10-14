@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo    Starting EVO Bypass
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo Install Node.js 20 or newer from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm was not found. Reinstall Node.js with npm enabled.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [SETUP] Installing the existing frontend and API dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
)

echo [1/2] Starting the existing API on port 3000...
start "EVO API" cmd /k "cd /d ""%~dp0server"" && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Starting the frontend on port 3001...
start "EVO Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo API:      http://localhost:3000/api/health
echo Frontend: http://localhost:3001
echo.
start "" "http://localhost:3001"
echo Both existing services were launched. Leave their terminal windows open.
pause
