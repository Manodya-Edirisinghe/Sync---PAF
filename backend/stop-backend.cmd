@echo off
setlocal

echo Stopping any process listening on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
  echo Stopping PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

echo Done.
