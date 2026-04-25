"""
S020 — Completar con N piezas del mismo color

Detecta: botella dst tiene k piezas del mismo color C (k ≥ 1)
         y botella src tiene exactamente (4-k) piezas de C en el tope
         → completar dst en un solo movimiento (Caso 1) o iniciar la
           secuencia de tránsito por el extra (Caso 2).

Cubre N=1 cuando la fuente tiene altura>1 (S010 ya cubre altura==1),
y los casos N=2 y N=3 que S010 no detecta.
"""

from state import Estado


def detectar(estado: Estado) -> dict | None:
    for dst in estado.botellas:
        if dst.esta_completa() or dst.esta_vacia():
            continue

        piezas_dst = [e for e in dst.espacios if e is not None]
        color = dst.tope()
        if any(p != color for p in piezas_dst):
            continue  # dst tiene colores mezclados

        n_libre = dst.libre()
        if n_libre == 0:
            continue
        if dst.bloqueada_entrada(color):
            continue

        # ── Caso 2: ya hay una pieza de C en el tope del extra ────
        if estado.capacidad_extra > 0:
            for i in range(len(estado.extra) - 1, -1, -1):
                if estado.extra[i] is not None:
                    if estado.extra[i] == color:
                        return {
                            'tipo': 'extra_a_botella',
                            'desde': None,
                            'hasta': dst.idx,
                            'piezas': [color],
                            '_extra_idx': i,
                        }
                    break  # tope del extra es otro color

        # ── Buscar fuente con exactamente n_libre piezas de C arriba
        for src in estado.botellas:
            if src is dst:
                continue
            if src.bloqueada_salida():
                continue
            if src.tope() != color:
                continue
            if src.piezas_en_tope() != n_libre:
                continue

            if estado.capacidad_extra == 0:
                return {
                    'tipo': 'botella_a_botella',
                    'desde': src.idx,
                    'hasta': dst.idx,
                    'piezas': [color] * n_libre,
                }
            else:
                if any(e is None for e in estado.extra):
                    return {
                        'tipo': 'botella_a_extra',
                        'desde': src.idx,
                        'hasta': None,
                        'piezas': [color],
                    }

    return None
