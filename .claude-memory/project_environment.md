---
name: Entorno de la PC
description: Configuración del sistema, restricciones y stack instalado
type: project
originSessionId: defdb3d7-497c-471a-8456-a20af157233f
---
**Sistema:** Windows 10 LTSC — sin Hyper-V, sin WSL, sin Docker.

**Why:** Restricciones de compatibilidad con otras cosas instaladas en la máquina. No proponer soluciones que requieran Docker o WSL.

**Stack instalado:**
- Node.js 24.15.0 / npm 11.12.1
- Angular CLI 21.2.8
- PostgreSQL 17.9 (usuario: postgres, contraseña: postgres, base: botellas)
- Git 2.54.0
- DBeaver 26.0.3
- Python 3.12.10 (instalado via winget el 2026-04-25, ruta: C:\Users\jgustavo\AppData\Local\Programs\Python\Python312\python.exe)

**Servicios:**
- Backend Node: http://localhost:3000
- Solver Python (FastAPI): http://localhost:8001 — iniciar con solver\run.bat
- Frontend Angular: http://localhost:4200

**Nota multi-PC:** el usuario trabaja desde dos PCs (casa en ciudad y playa). El proyecto está en GitHub (fogelmanjg/botellas). La memoria de Claude es local a cada máquina.

**How to apply:** Siempre proponer soluciones nativas para Windows sin contenedores.
