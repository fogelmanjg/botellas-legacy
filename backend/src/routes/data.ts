import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";

const router = Router();

// GET /data/export — export all main tables as JSON
router.get("/export", async (_req: Request, res: Response) => {
  try {
    // Use raw SELECT to include FK id columns (idjuego, idnivel, idgrupo, etc.)
    const juegos = await AppDataSource.query('SELECT * FROM juego');
    const niveles = await AppDataSource.query('SELECT * FROM nivel');
    const grupos = await AppDataSource.query('SELECT * FROM grupo');
    const botellas = await AppDataSource.query('SELECT * FROM botella');
    const bloqueos = await AppDataSource.query('SELECT * FROM bloqueo');
    const bloqueoGrupos = await AppDataSource.query('SELECT * FROM bloqueogrupo');
    const estrategias = await AppDataSource.query('SELECT * FROM estrategia');
    const soluciones = await AppDataSource.query('SELECT * FROM solucion');

    res.json({ juegos, niveles, grupos, botellas, bloqueos, bloqueoGrupos, estrategias, soluciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error exporting data" });
  }
});

// POST /data/import — import JSON payload exported by /export
router.post("/import", async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) return res.status(400).json({ error: "Missing payload" });

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // Delete children first to avoid FK issues.
    // Use explicit DELETE statements (TRUNCATE with FK constraints can fail).
    await queryRunner.query('DELETE FROM solucion');
    await queryRunner.query('DELETE FROM bloqueogrupo');
    await queryRunner.query('DELETE FROM botella');
    await queryRunner.query('DELETE FROM grupo');
    await queryRunner.query('DELETE FROM nivel');
    await queryRunner.query('DELETE FROM juego');
    await queryRunner.query('DELETE FROM bloqueo');
    await queryRunner.query('DELETE FROM estrategia');

    // Insert in sensible order. Convert raw FK id fields into relation objects so TypeORM sets FKs correctly.
    // Insert using raw SQL to preserve FK id columns exactly as exported
    if (payload.bloqueos) {
      for (const b of payload.bloqueos) {
        await queryRunner.query(
          `INSERT INTO bloqueo (idbloqueo, nombre, tipo, bloquea, desbloquea, entrada, salida, vista, css) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [b.idbloqueo, b.nombre, b.tipo ?? null, b.bloquea ?? null, b.desbloquea ?? null, b.entrada ?? null, b.salida ?? null, b.vista ?? null, b.css ?? null]
        );
      }
    }

    if (payload.estrategias) {
      for (const e of payload.estrategias) {
        await queryRunner.query(
          `INSERT INTO estrategia (idestategia, nombre, descripcion, peso, activa) VALUES ($1,$2,$3,$4,$5)`,
          [e.idestategia, e.nombre, e.descripcion ?? null, e.peso ?? null, e.activa ?? 'S']
        );
      }
    }

    if (payload.juegos) {
      for (const j of payload.juegos) {
        await queryRunner.query(
          `INSERT INTO juego (idjuego, nombre, editor) VALUES ($1,$2,$3)`,
          [j.idjuego, j.nombre, j.editor ?? null]
        );
      }
    }

    if (payload.niveles) {
      for (const n of payload.niveles) {
        await queryRunner.query(
          `INSERT INTO nivel (idnivel, numeronivel, capacidadextra, estadohash, validado, subidopor, idjuego) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [n.idnivel, n.numeronivel, n.capacidadextra ?? 0, n.estadohash ?? null, n.validado ?? 'N', n.subidopor ?? null, n.idjuego]
        );
      }
    }

    if (payload.grupos) {
      for (const g of payload.grupos) {
        await queryRunner.query(
          `INSERT INTO grupo (idgrupo, numerogrupo, entrada, idnivel) VALUES ($1,$2,$3,$4)`,
          [g.idgrupo, g.numerogrupo, g.entrada, g.idnivel]
        );
      }
    }

    if (payload.botellas) {
      for (const b of payload.botellas) {
        await queryRunner.query(
          `INSERT INTO botella (idbotella, numerobotella, color, espacio1, espacio2, espacio3, espacio4, idgrupo, idbloqueo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [b.idbotella, b.numerobotella, b.color ?? null, b.espacio1 ?? null, b.espacio2 ?? null, b.espacio3 ?? null, b.espacio4 ?? null, b.idgrupo, b.idbloqueo ?? null]
        );
      }
    }

    if (payload.bloqueoGrupos) {
      for (const bg of payload.bloqueoGrupos) {
        await queryRunner.query(
          `INSERT INTO bloqueogrupo (idbloqueogrupo, idgrupo, idbloqueo) VALUES ($1,$2,$3)`,
          [bg.idbloqueogrupo, bg.idgrupo, bg.idbloqueo]
        );
      }
    }

    if (payload.soluciones) {
      for (const s of payload.soluciones) {
        await queryRunner.query(
          `INSERT INTO solucion (idnivel, pasos, fechacalculo) VALUES ($1,$2,$3)`,
          [s.idnivel, JSON.stringify(s.pasos ?? null), s.fechacalculo ?? null]
        );
      }
    }

    await queryRunner.commitTransaction();

    // Fix sequences so future inserts don't conflict with imported IDs
    try {
      const seqs = [
        { name: 'juego_idjuego_seq', table: 'juego', col: 'idjuego' },
        { name: 'nivel_idnivel_seq', table: 'nivel', col: 'idnivel' },
        { name: 'grupo_idgrupo_seq', table: 'grupo', col: 'idgrupo' },
        { name: 'botella_idbotella_seq', table: 'botella', col: 'idbotella' },
        { name: 'bloqueo_idbloqueo_seq', table: 'bloqueo', col: 'idbloqueo' },
        { name: 'bloqueogrupo_idbloqueogrupo_seq', table: 'bloqueogrupo', col: 'idbloqueogrupo' },
        { name: 'estrategia_idestategia_seq', table: 'estrategia', col: 'idestategia' },
      ];

      for (const s of seqs) {
        await queryRunner.query(
          `SELECT setval('${s.name}', COALESCE((SELECT MAX(${s.col}) FROM ${s.table}), 1));`
        );
      }

      res.json({ ok: true, seqFix: true });
    } catch (err) {
      console.error('Error fixing sequences after import:', err);
      // Import succeeded but sequence fix failed — return success with warning
      res.status(200).json({ ok: true, seqFix: false, error: String(err) });
    }
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    res.status(500).json({ error: "Error importing data" });
  } finally {
    await queryRunner.release();
  }
});

export default router;
