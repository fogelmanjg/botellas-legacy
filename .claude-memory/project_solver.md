---
name: Arquitectura del solver
description: Diseño, estado actual y próximos pasos del solver Python
type: project
---

**Stack:** Python 3.12 / FastAPI / psycopg2 — puerto 8001. Iniciar con `solver\run.bat`.

**Arquitectura:** Rule-Directed Search (Búsqueda con Control por Reglas).
- Fase 1: estrategias deterministas (reconocen patrones, generan el próximo movimiento)
- Fase 2: fallback DFS cuando ninguna estrategia aplica
- Backtracking completo en ambas fases

**Why:** Los puzzles diseñados para humanos tienen estructura explotable. Las estrategias
deterministas cubren la mayoría de casos sin búsqueda ciega.

**Archivos clave:**
- solver/state.py — Estado, Botella (con reglas de bloqueo)
- solver/rules.py — movimientos válidos caso 1 (sin extra) y caso 2 (con extra)
- solver/engine.py — motor DFS con dos fases
- solver/strategies/__init__.py — registro de estrategias activas
- solver/strategies/s010_completar_unitaria.py — detecta patrón 3+1 mismo color

**Estrategias implementadas:**
- S010 (peso 10): 3 piezas de color C en botella A + 1 pieza de C en otra botella → completa A

**Estrategias pendientes:**
- S020: N piezas de C en A + (4−N) piezas de C en B → completar (generalización de S010)
- S030: misma situación pero la pieza está debajo de otra → despejar primero
- S999: BFS/fallback garantizado

**DB:**
- Tabla `estrategia` con 4 registros (peso 10/20/40/999)
- Tabla `solucion` con columna `estado` (P/R/S/X)

**How to apply:** Al agregar estrategias, seguir el patrón: módulo con función
`detectar(estado) -> dict | None`. Registrar en strategies/__init__.py con peso.

**Resultado verificado:** Nivel 3 (3R + 1R, capacidadextra=7) → 2 pasos con S010.
Sin S010 el DFS encontraba 6 pasos (subóptimo).
