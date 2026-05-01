"""
S010 — Completar unitaria

Detecta: botella A tiene 3 piezas del mismo color C (1 libre)
         y existe exactamente 1 pieza de C accesible en otra botella B (altura == 1).
Genera:  hint botella_a_extra desde B. El auto-movimiento llevará C a A
         si A es la botella de color para C, o el DFS explorará si no lo es.
"""

from state import Estado


def detectar(estado: Estado) -> dict | None:
    for a in estado.botellas:
        if a.altura() != 3:
            continue
        color = a.tope()
        if any(e != color for e in a.espacios if e is not None):
            continue
        if a.bloqueada_entrada(color):
            continue

        for b in estado.botellas:
            if b is a:
                continue
            if b.altura() != 1 or b.tope() != color:
                continue
            if b.bloqueada_salida():
                continue

            if estado.capacidad_extra == 0:
                return {
                    'tipo': 'botella_a_botella',
                    'desde': b.idx,
                    'hasta': a.idx,
                    'piezas': [color],
                    'automaticos': [],
                }
            if any(e is None for e in estado.extra):
                return {'tipo': 'botella_a_extra', 'desde': b.idx}

    return None
