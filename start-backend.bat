@echo off
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo Backend ya esta corriendo en puerto 3000.
) else (
    echo Iniciando backend...
    if not defined DB_HOST set DB_HOST=jg-server
    start "Botellas - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
)
