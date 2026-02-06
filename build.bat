@echo off
REM Full build script

echo ========================================
echo Building Spring Boot Project Manager
echo ========================================
echo.

echo Running Maven build with frontend integration...
call mvn clean package -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build Successful!
    echo ========================================
    echo.
    echo JAR file created at: target\spring-boot-project-manager-0.0.1-SNAPSHOT.jar
    echo.
    echo To run the application:
    echo java -jar target\spring-boot-project-manager-0.0.1-SNAPSHOT.jar
    echo.
) else (
    echo.
    echo ========================================
    echo Build Failed!
    echo ========================================
    echo Please check the error messages above.
)
