@echo off
:: Crea la base de datos botellas y carga el schema + seed data
:: Requiere PostgreSQL instalado con usuario postgres / password postgres

set PGPASSWORD=postgres
set PSQL=psql -U postgres

echo ============================================================
echo  SETUP BASE DE DATOS BOTELLAS
echo ============================================================
echo.

:: Crear la base de datos (ignora error si ya existe)
echo Creando base de datos...
%PSQL% -c "CREATE DATABASE botellas;" 2>nul
echo      OK (o ya existia)

:: Aplicar schema
echo Aplicando schema...
%PSQL% -d botellas -f "%~dp0db\schema.sql"
if %errorlevel% neq 0 (
  echo ERROR al aplicar schema. Verificar que PostgreSQL este corriendo.
  pause
  exit /b 1
)

:: Aplicar seed data
echo Cargando datos iniciales...
%PSQL% -d botellas -f "%~dp0db\seed.sql"

echo.
echo ============================================================
echo  Base de datos lista.
echo  SIGUIENTE PASO: setup-memory.bat (para la memoria de Claude)
echo  Luego iniciar:
echo    backend:  cd backend ^& npm run dev
echo    frontend: cd frontend ^& npm start
echo    solver:   solver\run.bat
echo ============================================================
pause
