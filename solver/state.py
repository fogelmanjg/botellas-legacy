"""
Representación del estado del juego para el solver.

Botella: lista de hasta 4 colores (None = vacío).
  - espacios[0] = fondo, espacios[3] = tope
  - El tope es el primer None de derecha a izquierda; debajo de él, las piezas.

Estado: lista de botellas activas + slots de la botella extra.
"""

from dataclasses import dataclass, field
from typing import Optional


CAPACIDAD = 4


@dataclass
class Botella:
    idx: int                          # índice en el estado (0-based)
    espacios: list[Optional[str]]     # 4 slots, None = vacío
    bloqueo: Optional[dict] = None    # bloqueo individual, None si no tiene

    def __post_init__(self):
        assert len(self.espacios) == CAPACIDAD

    # ── consultas ────────────────────────────────────────────────

    def tope(self) -> Optional[str]:
        """Último color desde el fondo (la pieza más accesible)."""
        for i in range(CAPACIDAD - 1, -1, -1):
            if self.espacios[i] is not None:
                return self.espacios[i]
        return None

    def altura(self) -> int:
        """Cantidad de piezas en la botella."""
        return sum(1 for e in self.espacios if e is not None)

    def libre(self) -> int:
        """Slots vacíos."""
        return CAPACIDAD - self.altura()

    def piezas_en_tope(self) -> int:
        """Cuántas piezas del mismo color están apiladas arriba."""
        color = self.tope()
        if color is None:
            return 0
        count = 0
        for i in range(CAPACIDAD - 1, -1, -1):
            if self.espacios[i] == color:
                count += 1
            elif self.espacios[i] is not None:
                break
        return count

    def esta_completa(self) -> bool:
        return self.altura() == CAPACIDAD and len(set(self.espacios)) == 1

    def esta_vacia(self) -> bool:
        return self.altura() == 0

    def puede_recibir(self, color: str) -> bool:
        """¿Puede aceptar una pieza de este color?"""
        if self.libre() == 0:
            return False
        t = self.tope()
        return t is None or t == color

    # ── bloqueo ──────────────────────────────────────────────────

    def bloqueada_entrada(self, color_fuente: Optional[str] = None) -> bool:
        """¿Está bloqueada como destino?"""
        bl = self.bloqueo
        if not bl:
            return False
        entrada = bl["entrada"]
        if entrada == "N":
            return True
        if entrada == "C":
            # Solo permite si el color de la fuente coincide con b.color
            return self.bloqueo.get("color_botella") != color_fuente
        return False  # 'S' = permite

    def bloqueada_salida(self) -> bool:
        """¿Está bloqueada como fuente?"""
        bl = self.bloqueo
        if not bl:
            return False
        return bl["salida"] == "N"

    def color_visible(self) -> bool:
        bl = self.bloqueo
        if not bl:
            return True
        return bl["vista"] != "N"

    # ── mutación ─────────────────────────────────────────────────

    def sacar(self, n: int) -> list[str]:
        """Extrae n piezas del tope. Devuelve las piezas extraídas."""
        piezas = []
        for i in range(CAPACIDAD - 1, -1, -1):
            if len(piezas) == n:
                break
            if self.espacios[i] is not None:
                piezas.append(self.espacios[i])
                self.espacios[i] = None
        return piezas

    def poner(self, piezas: list[str]):
        """Coloca piezas en los slots libres desde el fondo."""
        for pieza in reversed(piezas):
            for i in range(CAPACIDAD):
                if self.espacios[i] is None:
                    self.espacios[i] = pieza
                    break

    def copia(self) -> "Botella":
        return Botella(self.idx, list(self.espacios), self.bloqueo)

    def __repr__(self):
        return f"B{self.idx}[{','.join(e or '_' for e in self.espacios)}]"


@dataclass
class Estado:
    botellas: list[Botella]
    extra: list[Optional[str]]        # slots de la botella extra (puede estar vacía)
    capacidad_extra: int = 0

    # ── estado del juego ─────────────────────────────────────────

    def esta_resuelto(self) -> bool:
        """El juego se gana cuando todas las botellas están vacías o completas
        Y no quedan piezas flotando en el extra."""
        if not all(b.esta_vacia() or b.esta_completa() for b in self.botellas):
            return False
        return not any(e is not None for e in self.extra)

    def hash(self) -> str:
        """Hash canónico del estado para detectar ciclos."""
        partes = []
        for b in self.botellas:
            partes.append(",".join(e or "_" for e in b.espacios))
        extra_str = ",".join(e or "_" for e in self.extra)
        return "|".join(partes) + "||" + extra_str

    def copia(self) -> "Estado":
        return Estado(
            botellas=[b.copia() for b in self.botellas],
            extra=list(self.extra),
            capacidad_extra=self.capacidad_extra,
        )

    def __repr__(self):
        return f"Estado({self.botellas}, extra={self.extra})"


# ── Construcción del estado inicial desde datos de la DB ─────────

def estado_desde_nivel(nivel_data: dict) -> Estado:
    """
    Convierte los datos del nivel (output de db.cargar_nivel) al Estado inicial.
    - Ignora las botellas que ya están completas (no debería haber, pero por las dudas).
    - La botella extra se representa como una lista de slots vacíos de tamaño capacidadextra.
    """
    botellas: list[Botella] = []
    idx = 0
    for grupo in nivel_data["grupos"]:
        for b in grupo["botellas"]:
            espacios = [b["espacios"][i] for i in range(4)]
            bloqueo = b.get("bloqueo")
            # Si el bloqueo indica 'vista=N', las piezas son desconocidas para el jugador
            # pero el solver sí las conoce (trabaja con info completa)
            botella = Botella(idx=idx, espacios=espacios, bloqueo=bloqueo)
            if not botella.esta_completa():
                botellas.append(botella)
            idx += 1

    cap_extra = nivel_data.get("capacidadextra", 0)
    extra = [None] * cap_extra

    return Estado(botellas=botellas, extra=extra, capacidad_extra=cap_extra)
