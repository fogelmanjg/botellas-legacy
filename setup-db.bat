@echo off
:: Crea la base de datos botellas y carga el schema.
:: Si existe db\data.json, restaura todos los datos desde ahi (via restore.py).
:: Si no existe, carga los datos minimos desde db\seed.sql.
:: Requiere PostgreSQL instalado con usuario postgres / password postgres.

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

:: Restaurar datos
if exist "%~dp0db\data.json" (
    echo Restaurando datos desde db\data.json...
    python "%~dp0db\restore.py"
    if %errorlevel% neq 0 (
        echo ERROR al restaurar datos. Ver mensaje arriba.
        pause
        exit /b 1
    )
) else (
    echo No se encontro db\data.json - cargando seed minimo...
    %PSQL% -d botellas -f "%~dp0db\seed.sql"
)

echo.
echo ============================================================
echo  Base de datos lista.
echo  Iniciar servicios:
echo    backend:  cd backend ^& npm run dev
echo    frontend: cd frontend ^& npm start
echo    solver:   solver\run.bat
echo ============================================================
pause
