---
name: Botellas - Mecánicas de bloqueos
description: Cómo funciona cada tipo de bloqueo y cómo afecta al solver
type: project
originSessionId: 4fd45fe0-99ae-4ce5-bec1-eff8175612f8
---
## Campos del bloqueo (tabla `bloqueo`)
- `nombre`: identificador descriptivo
- `bloquea`: qué impide hacer
- `desbloquea`: cómo se quita
- `agrupa`: boolean — si el bloqueo actúa sobre un grupo de botellas

## Tipos confirmados

### Lona color (`agrupa=false`)
- Oculta completamente la botella (no se puede ver, sacar ni agregar).
- Se levanta cuando se llena una botella con el **color específico**.
- El color requerido se almacena en `botella.propiedades_bloqueo: {"color": "R"}`.
- `botella.color` queda libre para su otro uso (restricción de entrada de piezas).

### Lona (`agrupa=true`)
- Grupo de N lonas, cada una cubriendo una botella distinta (oculta, sin interacción).
- Por cada botella que se llena en el nivel (cualquier color), se levanta UNA lona del grupo.
- Para quitar todas las lonas del grupo hay que llenar N botellas.
- El grupo se define con `propiedades_bloqueo: {"lista de botellas": [...]}` en cada botella.

### Barrera (`agrupa=true`)
- Grupo de botellas que no permiten SACAR piezas (solo entrada).
- Se desbloquea para TODAS cuando cualquier botella del grupo se llena completamente.
- El grupo se define con `propiedades_bloqueo: {"lista de botellas": [...]}` en cada botella.

### Traba (`agrupa=false`)
- Individual y permanente: solo permite entrada de piezas, nunca salida.
- Nunca se desbloquea.
- Inicia vacía o con piezas de un único color.

## Regla de grupos
- Los grupos son **siempre de la misma fila** (implícito, validar en el editor).
- Pueden existir dos grupos distintos en la misma fila.
- No puede haber un grupo con botellas de distinta fila.

## Implicancias para el solver
- `fila` es relevante solo para el **layout visual**; el solver no necesita lógica de fila.
- Lo que importa para los bloqueos es la **pertenencia al grupo** (`lista de botellas`).
- El estado del juego debe trackear qué grupos tienen bloqueo activo.
- Barrera/Traba: esas botellas son "solo entrada" hasta que el bloqueo se levante (si aplica).
- Lona: las botellas cubiertas no son accesibles hasta que se levante su lona.
