"""
S010 — Completar unitaria

Detecta: botella A tiene 3 piezas del mismo color C (y 1 libre)
         y existe exactamente 1 pieza de C accesible:
           - tope de otra botella B con altura == 1, o
           - tope del extra (la pieza ya llegó ahí en el paso anterior)
Genera:  el siguiente paso para llevar esa pieza a A.

Al ser invocada en pasos consecutivos resuelve la secuencia completa:
  llamada 1 → B → Extra   (mueve la pieza al tránsito)
  llamada 2 → Extra → A   (completa la botella)
"""

from state import Estado


def detectar(estado: Estado) -> dict | None:
    for a in estado.botellas:
        if a.altura() != 3:
            continue
        color = a.tope()
        if any(e != color for e in a.espacios if e is not None):
            continue  # no todas las piezas son del mismo color
        if a.bloqueada_entrada(color):
            continue

        # ── Caso: la pieza ya está en el extra ──────────────────
        if estado.capacidad_extra > 0:
            for i in range(len(estado.extra) - 1, -1, -1):
                if estado.extra[i] is not None:
                    if estado.extra[i] == color:
                        return {
                            'tipo': 'extra_a_botella',
                            'desde': None,
                            'hasta': a.idx,
                            'piezas': [color],
                            '_extra_idx': i,
                        }
                    break  # el tope del extra es otro color, no sirve

        # ── Caso: hay una botella con exactamente 1 pieza de C ──
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
                }
            else:
                if any(e is None for e in estado.extra):
                    return {
                        'tipo': 'botella_a_extra',
                        'desde': b.idx,
                        'hasta': None,
                        'piezas': [color],
                    }

    return None
