@echo off
cd /d "%~dp0"
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)
echo Starting server...
echo.
node server.js
pause

