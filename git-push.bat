@echo off
cd /d "%~dp0"

echo Estado actual:
git status --short
echo.

:: ── Exportar datos antes del commit ─────────────────────────────────────────
:: TODO: eliminar este bloque cuando el proyecto llegue a una version estable y
::       los datos de produccion ya no necesiten viajar junto al codigo fuente.
echo Exportando datos a db\data.json...
curl -s -f http://localhost:3000/data/export -o db\data.json.tmp
if %errorlevel% neq 0 (
    echo ADVERTENCIA: no se pudo exportar desde el backend.
    echo   Asegurate de que el backend este corriendo en http://localhost:3000
    echo   Si continuas, db\data.json NO se actualizara en este commit.
    echo.
    set /p CONT="Continuar sin actualizar el export? (s/N): "
    if /i not "%CONT%"=="s" (
        echo Cancelado.
        if exist db\data.json.tmp del db\data.json.tmp
        pause
        exit /b 0
    )
    if exist db\data.json.tmp del db\data.json.tmp
) else (
    move /y db\data.json.tmp db\data.json >nul
    echo      OK - db\data.json actualizado.
    echo.
)
:: ─────────────────────────────────────────────────────────────────────────────

set /p MSG="Mensaje del commit (Enter para cancelar): "
if "%MSG%"=="" (
    echo Cancelado.
    pause
    exit /b 0
)

git add -A
git commit -m "%MSG%"
if %errorlevel% neq 0 (
    echo ERROR en el commit.
    pause
    exit /b 1
)

git push
if %errorlevel% neq 0 (
    echo ERROR en el push.
    pause
    exit /b 1
)

echo.
echo Listo.
pause
