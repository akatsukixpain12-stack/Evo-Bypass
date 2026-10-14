@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo       EVO BYPASS - ONE SERVER
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
    echo [SETUP] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
)

echo Starting EVO Bypass UI and API together on port 3000...
echo Open http://localhost:3000
start "" "http://localhost:3000"
call npm run dev
echo.
echo EVO Bypass stopped. Press any key to close this window.
pause >nul
