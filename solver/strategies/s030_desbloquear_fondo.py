"""
S030 — Desbloquear fondo homogéneo

Detecta: botella src con k piezas del mismo color C desde el fondo (k ≥ 1),
         bloqueada por al menos 1 pieza de otro color encima.
         El extra tiene al menos 1 slot libre.

Genera: botella_a_extra (mueve el tope de src al extra para empezar a despejar).

Justificación: una vez expuesto el fondo puro, S020/S010 pueden completar la botella
trayendo las piezas restantes de C desde otras botellas o el extra.

Ejemplo típico (nivel con cada botella 2+2):
  B0=[R,R,B,A] → S030 mueve A a extra, luego B a extra → B0=[R,R,_,_]
  B1=[B,B,R,A] → S030 mueve A, R → B1=[B,B,_,_]
  B2=[A,A,B,R] → S020 toma R del extra (ya puesto allí), S030 mueve B → B2=[A,A,_,_]
  Luego S020/S010 rellenan desde el extra en orden inverso → 12 pasos totales.
"""

from state import Estado


def _fondo_homogeneo(botella) -> tuple[str | None, int]:
    """Devuelve (color, k) donde k = cantidad de piezas del mismo color desde el fondo."""
    color = botella.espacios[0]
    if color is None:
        return None, 0
    k = 0
    for e in botella.espacios:
        if e == color:
            k += 1
        else:
            break
    return color, k


def detectar(estado: Estado) -> dict | None:
    if not any(e is None for e in estado.extra):
        return None  # extra lleno, imposible mover

    for src in estado.botellas:
        if src.esta_vacia() or src.esta_completa():
            continue
        if src.bloqueada_salida():
            continue

        _color, k = _fondo_homogeneo(src)
        if k == 0:
            continue
        if k == src.altura():
            continue  # todas las piezas son del mismo color: nada que desbloquear

        # Hay basura encima del fondo puro → mover tope a extra
        return {'tipo': 'botella_a_extra', 'desde': src.idx}

    return None
