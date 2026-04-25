@echo off
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo Backend ya esta corriendo en puerto 3000.
) else (
    echo Iniciando backend...
    start "Botellas - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
)
