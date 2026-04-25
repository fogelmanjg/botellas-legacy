"""
Reglas de movimiento del juego.

Caso 1: sin botella extra (capacidad_extra == 0)
  - Para mover de A a B: A no bloqueada en salida, B no bloqueada en entrada,
    B puede recibir el color de A, y se mueven TODAS las piezas del mismo color en tope de A.
  - Excepción: si B está vacía y A también quedaría vacía → movimiento inútil (no hacerlo).

Caso 2: con botella extra (capacidad_extra > 0)
  - Hay un "slot extra" que funciona como tránsito obligatorio.
  - Solo 1 pieza puede salir/entrar al slot extra por turno.
  - Una pieza en el slot extra puede ir a cualquier botella que la acepte.
  - Regla 4a: si una pieza llega a una botella y la completa, se retira del juego automáticamente.

Movimiento representado como dict:
  {
    "tipo": "botella_a_botella" | "botella_a_extra" | "extra_a_botella",
    "desde": int (idx botella) | None,
    "hasta": int (idx botella) | None,
    "piezas": [color, ...],
  }
"""

from state import Estado, Botella, CAPACIDAD
from typing import Optional


def movimientos_validos(estado: Estado) -> list[dict]:
    """Genera todos los movimientos válidos para el estado actual."""
    movs = []

    if estado.capacidad_extra == 0:
        movs.extend(_caso1(estado))
    else:
        movs.extend(_caso2(estado))

    return movs


# ── Caso 1: sin extra ────────────────────────────────────────────

def _caso1(estado: Estado) -> list[dict]:
    movs = []
    botellas = estado.botellas

    for i, src in enumerate(botellas):
        if src.esta_vacia() or src.esta_completa():
            continue
        if src.bloqueada_salida():
            continue

        color_tope = src.tope()
        n_piezas = src.piezas_en_tope()

        for j, dst in enumerate(botellas):
            if i == j:
                continue
            if dst.esta_completa():
                continue
            if dst.bloqueada_entrada(color_tope):
                continue
            if not dst.puede_recibir(color_tope):
                continue
            if dst.libre() < n_piezas:
                # No entra todo: cuánto entra?
                n = dst.libre()
            else:
                n = n_piezas

            # Movimiento inútil: fuente queda vacía y destino estaba vacío
            if dst.esta_vacia() and src.altura() == n:
                continue

            movs.append({
                "tipo": "botella_a_botella",
                "desde": i,
                "hasta": j,
                "piezas": [color_tope] * n,
            })

    return movs


# ── Caso 2: con extra ────────────────────────────────────────────

def _caso2(estado: Estado) -> list[dict]:
    movs = []
    extra = estado.extra
    botellas = estado.botellas

    # ── Botella → Extra (solo 1 pieza) ──────────────────────────
    # Buscar el primer slot libre en extra
    slot_libre_extra = next((i for i, e in enumerate(extra) if e is None), None)
    colores_en_extra = [e for e in extra if e is not None]
    extra_tiene_piezas = len(colores_en_extra) > 0
    if slot_libre_extra is not None:
        for i, src in enumerate(botellas):
            if src.esta_vacia() or src.esta_completa():
                continue
            if src.bloqueada_salida():
                continue

            if src.altura() == 1 and extra_tiene_piezas:
                # Vaciar la botella dejaría un hueco que el juego rellena con
                # una pieza aleatoria del extra. Imposible predecir cuál, pero
                # la probabilidad de conseguir cualquier color del extra es 1.
                # Modelamos como un swap atómico: la pieza de la botella va al
                # extra y un color específico del extra viene a la botella.
                color_actual = src.tope()
                for color_deseado in set(colores_en_extra):
                    if color_deseado != color_actual:
                        movs.append({
                            "tipo": "swap_con_extra",
                            "desde": i,
                            "hasta": i,
                            "piezas": [color_deseado],
                        })
                continue  # no generar botella_a_extra normal (sería un no-op)

            color = src.tope()
            movs.append({
                "tipo": "botella_a_extra",
                "desde": i,
                "hasta": None,
                "piezas": [color],
            })

    # ── Extra → Botella (solo 1 pieza desde el tope del extra) ──
    # El "tope" del extra es el último slot ocupado
    tope_extra_idx = None
    tope_extra_color = None
    for i in range(len(extra) - 1, -1, -1):
        if extra[i] is not None:
            tope_extra_idx = i
            tope_extra_color = extra[i]
            break

    if tope_extra_color is not None:
        for j, dst in enumerate(botellas):
            if dst.esta_completa():
                continue
            if dst.bloqueada_entrada(tope_extra_color):
                continue
            if not dst.puede_recibir(tope_extra_color):
                continue
            movs.append({
                "tipo": "extra_a_botella",
                "desde": None,
                "hasta": j,
                "piezas": [tope_extra_color],
                "_extra_idx": tope_extra_idx,
            })

    return movs


# ── Aplicar movimiento ───────────────────────────────────────────

def aplicar_movimiento(estado: Estado, mov: dict) -> Estado:
    """Aplica un movimiento y devuelve el nuevo estado (no modifica el original)."""
    nuevo = estado.copia()

    if mov["tipo"] == "botella_a_botella":
        src = nuevo.botellas[mov["desde"]]
        dst = nuevo.botellas[mov["hasta"]]
        piezas = src.sacar(len(mov["piezas"]))
        dst.poner(piezas)

    elif mov["tipo"] == "botella_a_extra":
        src = nuevo.botellas[mov["desde"]]
        piezas = src.sacar(1)
        # Poner en el primer slot libre del extra
        for i, e in enumerate(nuevo.extra):
            if e is None:
                nuevo.extra[i] = piezas[0]
                break

    elif mov["tipo"] == "extra_a_botella":
        dst = nuevo.botellas[mov["hasta"]]
        idx_e = mov["_extra_idx"]
        color = nuevo.extra[idx_e]
        nuevo.extra[idx_e] = None
        dst.poner([color])

    elif mov["tipo"] == "swap_con_extra":
        # Intercambio atómico: la pieza de la botella va al extra y el color
        # deseado viene del extra a la botella (probabilidad=1 con reintentos).
        src = nuevo.botellas[mov["desde"]]
        color_deseado = mov["piezas"][0]
        color_sacado = src.tope()
        # Reemplazar la ocurrencia más alta (topmost) de color_deseado en extra
        for i in range(len(nuevo.extra) - 1, -1, -1):
            if nuevo.extra[i] == color_deseado:
                nuevo.extra[i] = color_sacado
                break
        src.sacar(1)
        src.poner([color_deseado])

    return nuevo
