@echo off
REM Development mode - runs frontend and backend separately

echo ========================================
echo Development Mode
echo ========================================
echo.
echo This will start:
echo - Backend at http://localhost:8080
echo - Frontend at http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

start "Backend Server" cmd /k "mvn spring-boot:run"
timeout /t 3
start "Frontend Dev Server" cmd /k "cd src\main\frontend && yarn dev"

echo.
echo Both servers starting...
echo Check the opened windows for status
