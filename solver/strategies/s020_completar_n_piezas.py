"""
S020 — Completar con N piezas del mismo color

Detecta: botella dst tiene k piezas del mismo color C (k ≥ 1, sin mezcla)
         y botella src tiene exactamente (4-k) piezas de C en el tope.
Genera:  hint botella_a_extra desde src para iniciar la secuencia.
"""

from state import Estado


def detectar(estado: Estado) -> dict | None:
    for dst in estado.botellas:
        if dst.esta_completa() or dst.esta_vacia():
            continue

        piezas_dst = [e for e in dst.espacios if e is not None]
        color = dst.tope()
        if any(p != color for p in piezas_dst):
            continue
        n_libre = dst.libre()
        if n_libre == 0 or dst.bloqueada_entrada(color):
            continue

        for src in estado.botellas:
            if src is dst or src.bloqueada_salida():
                continue
            if src.tope() != color or src.piezas_en_tope() != n_libre:
                continue

            if estado.capacidad_extra == 0:
                return {
                    'tipo': 'botella_a_botella',
                    'desde': src.idx,
                    'hasta': dst.idx,
                    'piezas': [color] * n_libre,
                    'automaticos': [],
                }
            if any(e is None for e in estado.extra):
                return {'tipo': 'botella_a_extra', 'desde': src.idx}

    return None
