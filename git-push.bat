@echo off
cd /d "%~dp0"

echo Estado actual:
git status --short
echo.

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
