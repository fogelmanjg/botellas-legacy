"""
Registro de estrategias del solver.

Cada estrategia es un módulo con una función `detectar(estado) -> dict | None`.
- Retorna el próximo movimiento si reconoce su patrón en el estado actual.
- Retorna None si el patrón no aplica.

El engine las prueba en orden de peso (menor primero).
Si una estrategia genera un movimiento que lleva a un dead-end, el engine
retrocede y continúa con las siguientes estrategias / movimientos válidos.
"""

from state import Estado
from strategies import s010_completar_unitaria
from strategies import s020_completar_n_piezas
from strategies import s030_desbloquear_fondo

# (peso, nombre, función detectar)
ESTRATEGIAS: list[tuple[int, str, callable]] = [
    (10,  's010_completar_unitaria',  s010_completar_unitaria.detectar),
    (20,  's020_completar_n_piezas',  s020_completar_n_piezas.detectar),
    (30,  's030_desbloquear_fondo',   s030_desbloquear_fondo.detectar),
    # s040, ... se agregan aquí a medida que se implementan
]
