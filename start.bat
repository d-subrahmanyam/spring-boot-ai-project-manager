@echo off
REM Quick start script for Spring Boot Project Manager

echo ========================================
echo Spring Boot Project Manager
echo ========================================
echo.

echo Checking if frontend build exists...
if not exist "src\main\resources\static\index.html" (
    echo Frontend not built. Building now...
    cd src\main\frontend
    call yarn install
    call yarn build
    cd ..\..\..\
    echo Frontend build complete!
) else (
    echo Frontend already built.
)

echo.
echo Starting Spring Boot application...
echo Backend will be available at: http://localhost:8080
echo.

call mvn spring-boot:run
