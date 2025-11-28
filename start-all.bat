@echo off
echo Starting Power BI Embed Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd be-node && node server.js"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd fe-angular && npm start"
echo.
echo Both servers are starting in separate windows...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4201
echo.

