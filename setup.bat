@echo off
:: Setup completo del proyecto botellas en una PC nueva (Windows 10+, winget disponible)
:: Ejecutar como usuario normal (no requiere admin salvo PostgreSQL)

echo ============================================================
echo  SETUP BOTELLAS
echo ============================================================
echo.

:: ── 1. Node.js ───────────────────────────────────────────────
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel%==0 (
  echo      Node.js ya instalado.
) else (
  echo      Instalando Node.js 24...
  winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)

:: ── 2. Python 3.12 ───────────────────────────────────────────
echo [2/5] Verificando Python...
"%USERPROFILE%\AppData\Local\Programs\Python\Python312\python.exe" --version >nul 2>&1
if %errorlevel%==0 (
  echo      Python 3.12 ya instalado.
) else (
  echo      Instalando Python 3.12...
  winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
)

:: ── 3. PostgreSQL ─────────────────────────────────────────────
echo [3/5] Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel%==0 (
  echo      PostgreSQL ya instalado.
) else (
  echo      Instalando PostgreSQL 17...
  winget install PostgreSQL.PostgreSQL.17 --accept-package-agreements --accept-source-agreements
  echo      IMPORTANTE: recordar configurar usuario postgres con password 'postgres'
)

:: ── 4. Dependencias Node (backend + frontend) ─────────────────
echo [4/5] Instalando dependencias Node...
cd /d "%~dp0backend"
call npm install
cd /d "%~dp0frontend"
call npm install
cd /d "%~dp0"

:: ── 5. Angular CLI global ─────────────────────────────────────
echo [5/5] Verificando Angular CLI...
call ng version >nul 2>&1
if %errorlevel% neq 0 (
  echo      Instalando Angular CLI...
  call npm install -g @angular/cli
) else (
  echo      Angular CLI ya instalado.
)

echo.
echo ============================================================
echo  SIGUIENTE PASO: crear la base de datos
echo  Ejecutar: setup-db.bat
echo ============================================================
pause
