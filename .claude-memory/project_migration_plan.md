---
name: Plan de migración a Linux
description: jgustavo44 migrando de Windows a Linux usando jg-server (VM) como staging
type: project
originSessionId: 0c828e9a-98cd-4ccf-ba2a-299da1b5e3e6
---
jgustavo44 (Windows 10) está siendo migrado a Linux. El proceso:
1. jg-server es una VM Linux en VMware dentro de jgustavo44, accesible por Tailscale
2. Todo lo imprescindible se pasa primero a la VM
3. Luego: sacar el NVMe de Windows, poner uno limpio, instalar Linux bare metal
4. Levantar jg-server como VM en el Linux nuevo
5. Migrar gradualmente de la VM al Linux desktop nativo

**Why:** El usuario quiere migrar a Linux y usa la VM como safety net/staging area para no perder nada durante la transición.
**How to apply:** Cuando se hable de jgustavo44 o jg-server, tener en cuenta que jgustavo44 está en proceso de migración y jg-server es el repositorio temporal de datos/configuraciones importantes.
