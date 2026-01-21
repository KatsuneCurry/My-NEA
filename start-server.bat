@echo off
cd /d "%~dp0"
echo Checking dependencies
if not exist "node_modules" (
    echo Installing dependencies
    call npm install
)
echo Starting server
node server.js
pause




