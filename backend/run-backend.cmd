@echo off
setlocal

echo [1/2] Releasing port 8080 (if in use)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
  echo Stopping PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

echo [2/2] Starting Spring Boot...
set SPRING_PROFILES_ACTIVE=local
mvn spring-boot:run
