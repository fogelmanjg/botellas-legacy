import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "botellas"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASS", "postgres"),
    )

def cargar_nivel(idnivel: int) -> dict:
    """Carga un nivel con todos sus grupos, botellas y bloqueos desde la DB."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM nivel WHERE idnivel = %s", (idnivel,))
        nivel = dict(cur.fetchone())

        cur.execute("""
            SELECT g.idgrupo, g.numerogrupo, g.entrada,
                   bl.idbloqueo AS grupo_idbloqueo, bl.nombre AS grupo_bloqueo_nombre,
                   bl.entrada AS grup_bl_entrada, bl.salida AS grup_bl_salida,
                   bl.vista AS grup_bl_vista, bl.desbloquea AS grup_bl_desbloquea,
                   bl.tipo AS grup_bl_tipo
            FROM grupo g
            LEFT JOIN bloqueogrupo bg ON bg.idgrupo = g.idgrupo
            LEFT JOIN bloqueo bl ON bl.idbloqueo = bg.idbloqueo
            WHERE g.idnivel = %s
            ORDER BY g.numerogrupo
        """, (idnivel,))
        grupos_raw = cur.fetchall()

        cur.execute("""
            SELECT b.idbotella, b.idgrupo, b.numerobotella,
                   b.espacio1, b.espacio2, b.espacio3, b.espacio4,
                   b.color, b.idbloqueo,
                   bl.nombre AS bloqueo_nombre, bl.entrada AS bl_entrada,
                   bl.salida AS bl_salida, bl.vista AS bl_vista,
                   bl.desbloquea AS bl_desbloquea, bl.tipo AS bl_tipo
            FROM botella b
            LEFT JOIN bloqueo bl ON bl.idbloqueo = b.idbloqueo
            WHERE b.idgrupo IN (
                SELECT idgrupo FROM grupo WHERE idnivel = %s
            )
            ORDER BY b.idgrupo, b.numerobotella
        """, (idnivel,))
        botellas_raw = cur.fetchall()

        # Organizar botellas por grupo
        botellas_por_grupo: dict[int, list] = {}
        for b in botellas_raw:
            gid = b["idgrupo"]
            if gid not in botellas_por_grupo:
                botellas_por_grupo[gid] = []
            espacios = [b["espacio1"], b["espacio2"], b["espacio3"], b["espacio4"]]
            bloqueo_info = None
            if b["idbloqueo"]:
                bloqueo_info = {
                    "idbloqueo": b["idbloqueo"],
                    "nombre": b["bloqueo_nombre"],
                    "entrada": b["bl_entrada"],
                    "salida": b["bl_salida"],
                    "vista": b["bl_vista"],
                    "desbloquea": b["bl_desbloquea"],
                    "tipo": b["bl_tipo"],
                }
            botellas_por_grupo[gid].append({
                "idbotella": b["idbotella"],
                "numerobotella": b["numerobotella"],
                "espacios": espacios,
                "color": b["color"],
                "bloqueo": bloqueo_info,
            })

        # Armar grupos
        grupos = []
        for g in grupos_raw:
            gid = g["idgrupo"]
            bloqueo_grupo = None
            if g["grupo_idbloqueo"]:
                bloqueo_grupo = {
                    "idbloqueo": g["grupo_idbloqueo"],
                    "nombre": g["grupo_bloqueo_nombre"],
                    "entrada": g["grup_bl_entrada"],
                    "salida": g["grup_bl_salida"],
                    "vista": g["grup_bl_vista"],
                    "desbloquea": g["grup_bl_desbloquea"],
                    "tipo": g["grup_bl_tipo"],
                }
            grupos.append({
                "idgrupo": gid,
                "numerogrupo": g["numerogrupo"],
                "entrada": g["entrada"],
                "bloqueo": bloqueo_grupo,
                "botellas": botellas_por_grupo.get(gid, []),
            })

        nivel["grupos"] = grupos
        return nivel
    finally:
        cur.close()
        conn.close()

def guardar_solucion(idnivel: int, pasos: list, estado: str):
    conn = get_conn()
    cur = conn.cursor()
    try:
        import json
        cur.execute("""
            INSERT INTO solucion (idnivel, pasos, estado, fechacalculo)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (idnivel) DO UPDATE
              SET pasos = EXCLUDED.pasos,
                  estado = EXCLUDED.estado,
                  fechacalculo = EXCLUDED.fechacalculo
        """, (idnivel, json.dumps(pasos), estado))
        conn.commit()
    finally:
        cur.close()
        conn.close()

def marcar_resolviendo(idnivel: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO solucion (idnivel, pasos, estado, fechacalculo)
            VALUES (%s, NULL, 'R', NOW())
            ON CONFLICT (idnivel) DO UPDATE SET estado = 'R', fechacalculo = NOW()
        """, (idnivel,))
        conn.commit()
    finally:
        cur.close()
        conn.close()
