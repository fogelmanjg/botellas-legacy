@echo off
cd /d "%~dp0"
set PYTHON=C:\Users\jgustavo\AppData\Local\Programs\Python\Python312\python.exe

if not exist venv (
  echo Creando entorno virtual...
  "%PYTHON%" -m venv venv
  echo Instalando dependencias...
  venv\Scripts\pip install -r requirements.txt
)

echo Iniciando solver en http://localhost:8001
venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8001 --reload
