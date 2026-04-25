@echo off
netstat -ano | findstr ":8001" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo Solver ya esta corriendo en puerto 8001.
) else (
    echo Iniciando solver...
    start "Botellas - Solver" cmd /k ""%~dp0solver\run.bat""
)
