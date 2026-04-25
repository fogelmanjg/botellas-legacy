@echo off
netstat -ano | findstr ":4200" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo Frontend ya esta corriendo en puerto 4200.
) else (
    echo Iniciando frontend...
    start "Botellas - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
)
