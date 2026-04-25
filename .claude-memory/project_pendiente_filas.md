---
name: Filas del tablero
description: Las botellas se organizan en filas (hasta 4); fila es solo layout, no mecánica
type: project
originSessionId: 4fd45fe0-99ae-4ce5-bec1-eff8175612f8
---
## Concepto
Las botellas del tablero se distribuyen en hasta 4 filas. El campo `fila` (INT 1-4) en la tabla `botella` indica en qué fila está cada botella.

## Rol de la fila
- **Layout visual**: el editor muestra las botellas agrupadas por fila (sección separada por fila).
- **No es mecánica de juego**: el solver NO necesita lógica basada en fila.
- Los bloqueos que "agrupa botellas" son siempre de la misma fila (invariante), pero el mecanismo de desbloqueo se basa en el grupo (`lista de botellas`), no en la fila.

## Restricción de grupos
- Un grupo (barrera o lona) no puede tener botellas de distinta fila.
- Puede haber dos grupos independientes en la misma fila.

## Estado de implementación
- ✅ Campo `fila` en BD (migración ejecutada)
- ✅ Editor organiza botellas por fila
- ✅ Backend valida fila 1-4
- ✅ La lona sin color fue reemplazada por el tipo "Lona" con `agrupa=true` y grupo explícito
