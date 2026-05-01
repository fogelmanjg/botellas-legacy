"""
Restaura la base de datos desde db/data.json.

Uso:
    python db/restore.py

No requiere que el backend esté corriendo.
Conecta directo a PostgreSQL con las mismas credenciales que el solver.
"""

import json
import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
data_file  = os.path.join(script_dir, "data.json")

if not os.path.exists(data_file):
    print(f"ERROR: no se encontró {data_file}")
    sys.exit(1)

with open(data_file, encoding="utf-8") as f:
    payload = json.load(f)

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 no está instalado.")
    print("  Instalar: pip install psycopg2-binary")
    sys.exit(1)

conn = psycopg2.connect(
    host    = os.getenv("DB_HOST", "localhost"),
    port    = int(os.getenv("DB_PORT", 5432)),
    dbname  = os.getenv("DB_NAME", "botellas"),
    user    = os.getenv("DB_USER", "postgres"),
    password= os.getenv("DB_PASS", "postgres"),
)
cur = conn.cursor()

print("Borrando datos existentes...")
cur.execute("DELETE FROM solucion")
cur.execute("DELETE FROM bloqueogrupo")
cur.execute("DELETE FROM botella")
cur.execute("DELETE FROM grupo")
cur.execute("DELETE FROM nivel")
cur.execute("DELETE FROM juego")
cur.execute("DELETE FROM bloqueo")
cur.execute("DELETE FROM estrategia")

print("Insertando bloqueos...")
for b in payload.get("bloqueos", []):
    cur.execute(
        "INSERT INTO bloqueo (idbloqueo,nombre,tipo,bloquea,desbloquea,entrada,salida,vista,css) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        [b["idbloqueo"], b["nombre"], b.get("tipo"), b.get("bloquea"),
         b.get("desbloquea"), b.get("entrada"), b.get("salida"),
         b.get("vista"), b.get("css")],
    )

print("Insertando estrategias...")
for e in payload.get("estrategias", []):
    cur.execute(
        "INSERT INTO estrategia (idestategia,nombre,descripcion,peso,activa) "
        "VALUES (%s,%s,%s,%s,%s)",
        [e["idestategia"], e["nombre"], e.get("descripcion"),
         e.get("peso", 999), e.get("activa", "S")],
    )

print("Insertando juegos...")
for j in payload.get("juegos", []):
    cur.execute(
        "INSERT INTO juego (idjuego,nombre,editor) VALUES (%s,%s,%s)",
        [j["idjuego"], j["nombre"], j.get("editor")],
    )

print("Insertando niveles...")
for n in payload.get("niveles", []):
    cur.execute(
        "INSERT INTO nivel (idnivel,numeronivel,capacidadextra,estadohash,validado,subidopor,idjuego) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        [n["idnivel"], n["numeronivel"], n.get("capacidadextra", 0),
         n.get("estadohash"), n.get("validado", "N"),
         n.get("subidopor"), n["idjuego"]],
    )

print("Insertando grupos...")
for g in payload.get("grupos", []):
    cur.execute(
        "INSERT INTO grupo (idgrupo,numerogrupo,entrada,idnivel) VALUES (%s,%s,%s,%s)",
        [g["idgrupo"], g["numerogrupo"], g["entrada"], g["idnivel"]],
    )

print("Insertando botellas...")
for b in payload.get("botellas", []):
    cur.execute(
        "INSERT INTO botella (idbotella,numerobotella,color,espacio1,espacio2,espacio3,espacio4,idgrupo,idbloqueo) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        [b["idbotella"], b["numerobotella"], b.get("color"),
         b.get("espacio1"), b.get("espacio2"), b.get("espacio3"), b.get("espacio4"),
         b["idgrupo"], b.get("idbloqueo")],
    )

print("Insertando bloqueogrupos...")
for bg in payload.get("bloqueoGrupos", []):
    cur.execute(
        "INSERT INTO bloqueogrupo (idbloqueogrupo,idgrupo,idbloqueo) VALUES (%s,%s,%s)",
        [bg["idbloqueogrupo"], bg["idgrupo"], bg["idbloqueo"]],
    )

print("Insertando soluciones...")
for s in payload.get("soluciones", []):
    cur.execute(
        "INSERT INTO solucion (idnivel,pasos,fechacalculo) VALUES (%s,%s,%s)",
        [s["idnivel"], json.dumps(s.get("pasos")), s.get("fechacalculo")],
    )

print("Corrigiendo sequences...")
seqs = [
    ("juego_idjuego_seq",                  "juego",       "idjuego"),
    ("nivel_idnivel_seq",                  "nivel",       "idnivel"),
    ("grupo_idgrupo_seq",                  "grupo",       "idgrupo"),
    ("botella_idbotella_seq",              "botella",     "idbotella"),
    ("bloqueo_idbloqueo_seq",              "bloqueo",     "idbloqueo"),
    ("bloqueogrupo_idbloqueogrupo_seq",    "bloqueogrupo","idbloqueogrupo"),
    ("estrategia_idestategia_seq",         "estrategia",  "idestategia"),
]
for seq, tabla, col in seqs:
    cur.execute(f"SELECT setval('{seq}', COALESCE((SELECT MAX({col}) FROM {tabla}), 1))")

conn.commit()
cur.close()
conn.close()
print("Restauración completada.")
