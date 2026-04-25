"""FastAPI solver service."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import threading

from db import cargar_nivel, guardar_solucion, marcar_resolviendo
from state import estado_desde_nivel
from engine import resolver

app = FastAPI(title="Botellas Solver", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/resolver/{idnivel}")
def resolver_nivel(idnivel: int, async_mode: bool = False):
    """
    Resuelve un nivel y guarda la solución en la DB.
    - async_mode=false (default): bloquea hasta tener resultado.
    - async_mode=true: inicia en background y retorna inmediatamente.
    """
    try:
        nivel_data = cargar_nivel(idnivel)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Nivel no encontrado: {e}")

    if async_mode:
        marcar_resolviendo(idnivel)
        t = threading.Thread(target=_resolver_bg, args=(idnivel, nivel_data), daemon=True)
        t.start()
        return {"status": "resolviendo", "idnivel": idnivel}

    return _ejecutar_solver(idnivel, nivel_data)


def _resolver_bg(idnivel: int, nivel_data: dict):
    try:
        _ejecutar_solver(idnivel, nivel_data)
    except Exception as e:
        guardar_solucion(idnivel, [], "X")


def _ejecutar_solver(idnivel: int, nivel_data: dict) -> dict:
    estado = estado_desde_nivel(nivel_data)
    marcar_resolviendo(idnivel)

    solucion = resolver(estado)

    if solucion is None:
        guardar_solucion(idnivel, [], "X")
        return {"status": "sin_solucion", "idnivel": idnivel, "pasos": 0}

    # Serializar pasos eliminando campos internos (_extra_idx, etc.)
    pasos_limpios = []
    for mov in solucion:
        paso = {k: v for k, v in mov.items() if not k.startswith("_")}
        pasos_limpios.append(paso)

    guardar_solucion(idnivel, pasos_limpios, "S")
    return {
        "status": "resuelto",
        "idnivel": idnivel,
        "pasos": len(pasos_limpios),
        "solucion": pasos_limpios,
    }


@app.get("/solucion/{idnivel}")
def obtener_solucion(idnivel: int):
    """Consulta la solución guardada para un nivel."""
    import psycopg2.extras
    from db import get_conn
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM solucion WHERE idnivel = %s", (idnivel,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Sin solución guardada")
        return dict(row)
    finally:
        cur.close()
        conn.close()
