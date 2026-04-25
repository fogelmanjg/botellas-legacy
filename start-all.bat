@echo off
echo ============================================================
echo  BOTELLAS - Levantando servicios
echo ============================================================
echo.

:: Backend (puerto 3000)
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Backend ya corriendo   ^(puerto 3000^)
) else (
    echo [>>] Iniciando backend...
    start "Botellas - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
)

:: Solver (puerto 8001)
netstat -ano | findstr ":8001" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Solver ya corriendo    ^(puerto 8001^)
) else (
    echo [>>] Iniciando solver...
    start "Botellas - Solver" cmd /k ""%~dp0solver\run.bat""
)

:: Frontend (puerto 4200)
netstat -ano | findstr ":4200" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Frontend ya corriendo  ^(puerto 4200^)
) else (
    echo [>>] Iniciando frontend...
    start "Botellas - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
)

echo.
echo Listo. Cada servicio nuevo abre en su propia ventana.
echo Frontend disponible en: http://localhost:4200
echo.
pause
