---
name: Botellas - Mecánicas del juego
description: Reglas completas del water sort puzzle que el proyecto debe modelar y resolver
type: project
originSessionId: defdb3d7-497c-471a-8456-a20af157233f
---
El proyecto resuelve el "water sort puzzle" (juego de ordenar tubos/botellas). El backend corre un solver BFS y devuelve los pasos.

## Mecánicas confirmadas

**Botellas normales:**
- 4 espacios cada una
- Se llenan de abajo hacia arriba: espacio 1 = fondo, espacio 4 = tope
- Los espacios vacíos quedan arriba (ej: 1 espacio vacío → espacio 4 vacío)
- Solo se puede sacar/poner desde el tope

**Botella especial (extra):**
- Algunas versiones tienen 1 botella adicional con capacidad variable (definida al inicio)
- No requiere que los colores se agreguen en orden (reglas de llenado diferentes)

**Botellas bloqueadas:**
- Algunas botellas pueden estar bloqueadas/ocultas y no verse
- No se puede interactuar con ellas

**Colores ocultos (fog mechanic):**
- Un espacio puede estar ocupado pero con color desconocido ("?")
- El color se revela al quedar expuesto (cuando el espacio superior se vacía)
- Ejemplo: espacio 2 tiene color desconocido → para revelarlo hay que quitar espacio 3 → para quitar espacio 3 hay que quitar espacio 4 primero

**Why:** El solver debe manejar estado parcialmente observable. Los colores ocultos no se conocen hasta que se exponen.

**How to apply:** El estado del juego en el modelo debe soportar: colores normales, color=null (vacío), color="?" (ocupado pero desconocido), botella=bloqueada. El solver BFS necesita manejar incertidumbre cuando hay colores ocultos.
