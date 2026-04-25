@echo off
:: Enlaza la carpeta de memoria de Claude Code al repo.
:: Ejecutar UNA SOLA VEZ en cada PC nueva despues de clonar el repo.

set REPO=%~dp0
set MEMORY_REPO=%REPO%.claude-memory
set CLAUDE_DIR=%USERPROFILE%\.claude\projects\c--Users-jgustavo-botellas
set MEMORY_CLAUDE=%CLAUDE_DIR%\memory

echo === Setup de memoria Claude ===
echo Repo:   %MEMORY_REPO%
echo Claude: %MEMORY_CLAUDE%
echo.

:: Crear carpeta del proyecto en .claude si no existe
if not exist "%CLAUDE_DIR%" mkdir "%CLAUDE_DIR%"

:: Si ya existe la carpeta memory (no junction), hacer backup y borrar
if exist "%MEMORY_CLAUDE%" (
  echo Carpeta existente encontrada, haciendo backup...
  rename "%MEMORY_CLAUDE%" memory_backup_%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%
)

:: Crear junction
mklink /J "%MEMORY_CLAUDE%" "%MEMORY_REPO%"

if %errorlevel%==0 (
  echo.
  echo Listo. La memoria de Claude apunta al repo.
  echo De ahora en mas: git pull trae la memoria actualizada.
) else (
  echo ERROR al crear el junction.
)
pause
