"""
Motor de resolución con estrategias deterministas + fallback DFS.

Flujo por nodo:
  1. Probar cada estrategia (en orden de peso).
     Si genera un movimiento → intentarlo primero.
  2. Intentar todos los movimientos válidos restantes (fallback).
  3. Si ninguno progresa → retroceder (backtrack).

Esto garantiza que los patrones conocidos se exploran antes que la búsqueda
ciega, acortando dramáticamente el árbol para niveles con patrones frecuentes.
"""

import sys
from state import Estado
from rules import movimientos_validos, aplicar_movimiento
from strategies import ESTRATEGIAS

sys.setrecursionlimit(50_000)

MAX_PASOS = 300


def resolver(estado_inicial: Estado) -> list[dict] | None:
    visitados: set[str] = {estado_inicial.hash()}
    return _dfs(estado_inicial, visitados, [])


def _fingerprint(mov: dict) -> str:
    return f"{mov['tipo']}|{mov.get('desde')}|{mov.get('hasta')}|{mov['piezas']}"


def _dfs(estado: Estado, visitados: set[str], camino: list[dict]) -> list[dict] | None:
    if estado.esta_resuelto():
        return list(camino)

    if len(camino) >= MAX_PASOS:
        return None

    intentados: set[str] = set()

    # ── Fase 1: movimientos sugeridos por estrategias ────────────
    for _peso, _nombre, detectar in ESTRATEGIAS:
        mov = detectar(estado)
        if mov is None:
            continue
        fp = _fingerprint(mov)
        if fp in intentados:
            continue
        intentados.add(fp)

        resultado = _intentar(mov, estado, visitados, camino)
        if resultado is not None:
            return resultado

    # ── Fase 2: fallback — todos los movimientos válidos ─────────
    for mov in movimientos_validos(estado):
        fp = _fingerprint(mov)
        if fp in intentados:
            continue
        intentados.add(fp)

        resultado = _intentar(mov, estado, visitados, camino)
        if resultado is not None:
            return resultado

    return None


def _intentar(mov: dict, estado: Estado, visitados: set[str], camino: list[dict]) -> list[dict] | None:
    nuevo = aplicar_movimiento(estado, mov)
    h = nuevo.hash()
    if h in visitados:
        return None
    visitados.add(h)
    camino.append(mov)
    resultado = _dfs(nuevo, visitados, camino)
    if resultado is not None:
        return resultado
    camino.pop()
    return None
