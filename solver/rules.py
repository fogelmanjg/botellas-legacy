"""
Reglas de movimiento del juego.

Caso 1 (sin extra): movimientos directos botella_a_botella.

Caso 2 (con extra): el único movimiento del jugador es botella_a_extra.
  Mueve min(piezas_en_tope, slots_libres_extra) piezas al extra.
  Tras cada acción, el motor aplica automáticos encadenados hasta estabilidad.

Prioridades para destino forzado de pieza en extra:
  3. Botella con bloqueo Color para ese color → SOLO ahí (aunque haya otras válidas).
  4. Esa botella existe pero no puede recibir (tope bloqueado) → se queda en extra.
  5. Sin botella de color: cualquier botella válida (prefiere 1-2 piezas en fondo).

Formato del movimiento:
  {
    "tipo": "botella_a_botella" | "botella_a_extra",
    "desde": int,
    "hasta": int | None,
    "piezas": [color, ...],
    "automaticos": [
      {"tipo": "extra_a_botella", "hasta": int, "piezas": [color], "_extra_idx": int},
      ...
    ]
  }
"""

from __future__ import annotations
from typing import Optional
from state import Estado, Botella


# ── API pública ──────────────────────────────────────────────────

def movimientos_validos(estado: Estado) -> list[dict]:
    if estado.capacidad_extra == 0:
        return _caso1(estado)
    return _caso2(estado)


def completar_mov(estado: Estado, mov: dict) -> list[dict]:
    """Recibe un hint de estrategia y devuelve movimiento(s) completo(s) con automaticos."""
    if mov["tipo"] != "botella_a_extra":
        return [mov]
    return _expandir_desde(estado, mov["desde"])


def aplicar_movimiento(estado: Estado, mov: dict) -> Estado:
    nuevo = estado.copia()

    if mov["tipo"] == "botella_a_botella":
        src = nuevo.botellas[mov["desde"]]
        dst = nuevo.botellas[mov["hasta"]]
        dst.poner(src.sacar(len(mov["piezas"])))

    elif mov["tipo"] == "botella_a_extra":
        src = nuevo.botellas[mov["desde"]]
        n = len(mov["piezas"])
        color = mov["piezas"][0]
        src.sacar(n)
        colocados = 0
        for j in range(len(nuevo.extra)):
            if colocados == n:
                break
            if nuevo.extra[j] is None:
                nuevo.extra[j] = color
                colocados += 1
        for amov in mov.get("automaticos", []):
            idx_e = amov["_extra_idx"]
            color_a = amov["piezas"][0]
            if nuevo.extra[idx_e] == color_a:
                nuevo.extra[idx_e] = None
            else:
                for j in range(len(nuevo.extra)):
                    if nuevo.extra[j] == color_a:
                        nuevo.extra[j] = None
                        break
            nuevo.botellas[amov["hasta"]].poner([color_a])

    return nuevo


# ── Caso 1: sin extra ────────────────────────────────────────────

def _caso1(estado: Estado) -> list[dict]:
    movs = []
    for i, src in enumerate(estado.botellas):
        if src.esta_vacia() or src.esta_completa() or src.bloqueada_salida():
            continue
        color = src.tope()
        n = src.piezas_en_tope()
        for j, dst in enumerate(estado.botellas):
            if i == j or dst.esta_completa() or dst.bloqueada_entrada(color):
                continue
            if not dst.puede_recibir(color):
                continue
            n_mover = min(n, dst.libre())
            if dst.esta_vacia() and src.altura() == n_mover:
                continue
            movs.append({
                "tipo": "botella_a_botella",
                "desde": i,
                "hasta": j,
                "piezas": [color] * n_mover,
                "automaticos": [],
            })
    return movs


# ── Caso 2: con extra ────────────────────────────────────────────

def _caso2(estado: Estado) -> list[dict]:
    if not any(e is None for e in estado.extra):
        return []
    movs = []
    for i, src in enumerate(estado.botellas):
        if src.esta_vacia() or src.esta_completa() or src.bloqueada_salida():
            continue
        movs.extend(_expandir_desde(estado, i))
    return movs


def _expandir_desde(estado: Estado, i: int) -> list[dict]:
    """Genera todos los movimientos completos para mover desde botella i al extra."""
    src = estado.botellas[i]
    if src.esta_vacia() or src.esta_completa() or src.bloqueada_salida():
        return []
    color = src.tope()
    n_en_tope = src.piezas_en_tope()
    slots_libres = sum(1 for e in estado.extra if e is None)
    n = min(n_en_tope, slots_libres)
    if n == 0:
        return []

    # Simular: colocar n piezas en extra y sacarlas de la fuente
    extra_sim = list(estado.extra)
    colocados = 0
    for j in range(len(extra_sim)):
        if colocados == n:
            break
        if extra_sim[j] is None:
            extra_sim[j] = color
            colocados += 1

    botellas_sim = [b.copia() for b in estado.botellas]
    botellas_sim[i].sacar(n)

    resultados = _calcular_automaticos(botellas_sim, extra_sim)
    return [
        {
            "tipo": "botella_a_extra",
            "desde": i,
            "piezas": [color] * n,
            "automaticos": auto_movs,
        }
        for auto_movs, _, _ in resultados
    ]


def _calcular_automaticos(
    botellas: list[Botella],
    extra: list[Optional[str]],
) -> list[tuple[list[dict], list[Botella], list[Optional[str]]]]:
    """
    Calcula los movimientos automáticos encadenados desde el estado del extra.
    Devuelve lista de (auto_movs, botellas_finales, extra_final).
    Múltiples resultados cuando hay no-determinismo en el destino.
    """
    for idx_e, color in enumerate(extra):
        if color is None:
            continue
        destinos = _destinos_posibles(botellas, color)
        if not destinos:
            continue  # esta pieza se queda, revisar siguiente

        todos: list[tuple] = []
        for dest_idx in destinos:
            nuevo_extra = list(extra)
            nuevo_extra[idx_e] = None
            nuevas_botellas = [b.copia() for b in botellas]
            nuevas_botellas[dest_idx].poner([color])

            amov = {
                "tipo": "extra_a_botella",
                "hasta": dest_idx,
                "piezas": [color],
                "_extra_idx": idx_e,
            }
            sub = _calcular_automaticos(nuevas_botellas, nuevo_extra)
            for sub_movs, final_bots, final_extra in sub:
                todos.append(([amov] + sub_movs, final_bots, final_extra))
        return todos

    return [([], botellas, extra)]


def _destinos_posibles(botellas: list[Botella], color: str) -> list[int]:
    """
    Destinos posibles para una pieza de este color saliendo del extra.

    Prioridad 3: botella con bloqueo Color para este color → solo ella.
    Prioridad 4: esa botella existe pero no puede recibir → [] (se queda).
    Prioridad 5: sin bloqueo Color → botellas válidas (1-2 piezas primero).
    """
    color_locked = [
        b for b in botellas
        if b.bloqueo
        and b.bloqueo.get("entrada") == "C"
        and b.bloqueo.get("color_botella") == color
        and not b.esta_completa()
    ]
    if color_locked:
        validas = [b for b in color_locked if b.puede_recibir(color)]
        return [b.idx for b in validas]

    validas = [
        b for b in botellas
        if not b.esta_completa()
        and not b.bloqueada_entrada(color)
        and b.puede_recibir(color)
    ]
    if not validas:
        return []

    alta = [b for b in validas if 1 <= b.altura() <= 2]
    ids_alta = {b.idx for b in alta}
    baja = [b for b in validas if b.idx not in ids_alta]
    return [b.idx for b in (alta + baja)]
