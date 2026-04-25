import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Nivel } from "../entity/Nivel";
import { Grupo } from "../entity/Grupo";
import { Botella } from "../entity/Botella";
import { BloqueoGrupo } from "../entity/BloqueoGrupo";
import { Juego } from "../entity/Juego";
import { Bloqueo } from "../entity/Bloqueo";

const router = Router();

function validarEspacio(v: unknown): string | null | undefined {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "") return null;
  if (s === "x") return "x";
  if (/^[A-Z]$/.test(s)) return s;
  if (/^[a-z]$/.test(s)) return s.toUpperCase();
  return undefined;
}

function espaciosArray(b: Botella): (string | null)[] {
  return [b.espacio1, b.espacio2, b.espacio3, b.espacio4];
}

function serializarGrupo(g: Grupo) {
  return {
    idgrupo: g.idgrupo,
    numerogrupo: g.numerogrupo,
    entrada: g.entrada,
    bloqueo: g.bloqueoGrupos?.[0]?.bloqueo ?? null,
    botellas: (g.botellas ?? [])
      .sort((a, b) => a.numerobotella - b.numerobotella)
      .map((b) => ({
        idbotella: b.idbotella,
        numerobotella: b.numerobotella,
        color: b.color,
        bloqueo: b.bloqueo,
        espacios: espaciosArray(b),
      })),
  };
}

// Valida el array de botellas dentro de un grupo. Devuelve string de error o null.
function validarBotellas(botellas: unknown[], grupoIdx: number): string | null {
  if (!Array.isArray(botellas) || botellas.length === 0)
    return `grupos[${grupoIdx}].botellas debe ser un array no vacío`;
  for (const [i, b] of (botellas as any[]).entries()) {
    if (typeof b.numerobotella !== "number")
      return `grupos[${grupoIdx}].botellas[${i}].numerobotella debe ser un número`;
    if (b.color != null && !/^[A-Z]$/.test(String(b.color).trim()))
      return `grupos[${grupoIdx}].botellas[${i}].color inválido`;
    for (const campo of ["espacio1", "espacio2", "espacio3", "espacio4"]) {
      if (validarEspacio((b as any)[campo]) === undefined)
        return `grupos[${grupoIdx}].botellas[${i}].${campo} inválido`;
    }
  }
  return null;
}

// Valida el array de grupos del body. Devuelve string de error o null.
function validarGrupos(grupos: unknown[]): string | null {
  if (!Array.isArray(grupos) || grupos.length === 0)
    return "grupos debe ser un array no vacío";
  for (const [i, g] of (grupos as any[]).entries()) {
    if (typeof g.numerogrupo !== "number")
      return `grupos[${i}].numerogrupo debe ser un número`;
    if (typeof g.entrada !== "number" || g.entrada < 1 || g.entrada > 4)
      return `grupos[${i}].entrada debe ser 1, 2, 3 o 4`;
    const err = validarBotellas(g.botellas, i);
    if (err) return err;
  }
  return null;
}

// Crea los grupos y botellas de un nivel dentro de una transacción
async function crearGrupos(em: any, nivel: Nivel, gruposInput: any[]) {
  for (const g of gruposInput) {
    const grupo = em.getRepository(Grupo).create({
      nivel,
      numerogrupo: g.numerogrupo,
      entrada: g.entrada,
    });
    await em.getRepository(Grupo).save(grupo);

    // Bloqueo grupal (lona, barrera, etc.)
    if (g.idbloqueo != null) {
      const bloqueo = await em.getRepository(Bloqueo).findOneBy({ idbloqueo: Number(g.idbloqueo) });
      if (!bloqueo) throw Object.assign(new Error("Bloqueo no encontrado"), { status: 404 });
      const bg = em.getRepository(BloqueoGrupo).create({ grupo, bloqueo });
      await em.getRepository(BloqueoGrupo).save(bg);
    }

    // Botellas del grupo
    for (const b of g.botellas) {
      let bloqueo: Bloqueo | null = null;
      if (b.idbloqueo != null) {
        bloqueo = await em.getRepository(Bloqueo).findOneBy({ idbloqueo: Number(b.idbloqueo) });
        if (!bloqueo) throw Object.assign(new Error("Bloqueo no encontrado"), { status: 404 });
      }
      const botella = em.getRepository(Botella).create({
        grupo,
        numerobotella: b.numerobotella,
        color: b.color != null ? String(b.color).trim().toUpperCase() : null,
        bloqueo,
        espacio1: validarEspacio(b.espacio1) ?? null,
        espacio2: validarEspacio(b.espacio2) ?? null,
        espacio3: validarEspacio(b.espacio3) ?? null,
        espacio4: validarEspacio(b.espacio4) ?? null,
      });
      await em.getRepository(Botella).save(botella);
    }
  }
}

// GET /niveles?idjuego=N
router.get("/", async (req: Request, res: Response) => {
  const where = req.query.idjuego
    ? { juego: { idjuego: Number(req.query.idjuego) } }
    : {};
  const niveles = await AppDataSource.getRepository(Nivel).find({
    where,
    relations: ["juego"],
    order: { numeronivel: "ASC" },
  });
  res.json(niveles);
});

// GET /niveles/:id
router.get("/:id", async (req: Request, res: Response) => {
  const nivel = await AppDataSource.getRepository(Nivel).findOne({
    where: { idnivel: Number(req.params.id) },
    relations: [
      "juego",
      "grupos",
      "grupos.botellas",
      "grupos.botellas.bloqueo",
      "grupos.bloqueoGrupos",
      "grupos.bloqueoGrupos.bloqueo",
    ],
    order: { grupos: { numerogrupo: "ASC" } },
  });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });

  res.json({
    idnivel: nivel.idnivel,
    numeronivel: nivel.numeronivel,
    capacidadextra: nivel.capacidadextra,
    estadohash: nivel.estadohash,
    validado: nivel.validado,
    subidopor: nivel.subidopor,
    juego: nivel.juego,
    grupos: nivel.grupos.sort((a, b) => a.numerogrupo - b.numerogrupo).map(serializarGrupo),
  });
});

// POST /niveles
router.post("/", async (req: Request, res: Response) => {
  const { idjuego, numeronivel, capacidadextra = 0, grupos: gruposInput } = req.body;

  if (idjuego == null)
    return res.status(400).json({ error: "idjuego es requerido" });
  if (typeof numeronivel !== "number")
    return res.status(400).json({ error: "numeronivel debe ser un número" });
  if (typeof capacidadextra !== "number" || capacidadextra < 0)
    return res.status(400).json({ error: "capacidadextra debe ser un número >= 0" });

  const err = validarGrupos(gruposInput);
  if (err) return res.status(400).json({ error: err });

  await AppDataSource.transaction(async (em) => {
    const juego = await em.getRepository(Juego).findOneBy({ idjuego: Number(idjuego) });
    if (!juego) throw Object.assign(new Error("Juego no encontrado"), { status: 404 });

    const nivel = em.getRepository(Nivel).create({ juego, numeronivel, capacidadextra });
    await em.getRepository(Nivel).save(nivel);

    await crearGrupos(em, nivel, gruposInput);

    res.status(201).json({ idnivel: nivel.idnivel });
  }).catch((err: any) => {
    if (!res.headersSent) {
      if (err.code === "23505") return res.status(409).json({ error: "Ya existe un nivel con ese número en este juego" });
      res.status(err.status ?? 500).json({ error: err.message });
    }
  });
});

// PUT /niveles/:id — reemplaza metadata y todos los grupos/botellas si se pasa grupos[]
router.put("/:id", async (req: Request, res: Response) => {
  const gruposInput: unknown[] | null = Array.isArray(req.body.grupos) ? req.body.grupos : null;

  if (gruposInput !== null) {
    const err = validarGrupos(gruposInput);
    if (err) return res.status(400).json({ error: err });
  }

  await AppDataSource.transaction(async (em) => {
    const nivel = await em.getRepository(Nivel).findOne({
      where: { idnivel: Number(req.params.id) },
      relations: ["juego", "grupos", "grupos.botellas", "grupos.bloqueoGrupos"],
    });
    if (!nivel) throw Object.assign(new Error("Nivel no encontrado"), { status: 404 });

    if (typeof req.body.numeronivel === "number") nivel.numeronivel = req.body.numeronivel;
    if (typeof req.body.capacidadextra === "number") nivel.capacidadextra = req.body.capacidadextra;

    if ("idjuego" in req.body) {
      if (req.body.idjuego == null)
        throw Object.assign(new Error("idjuego no puede ser nulo"), { status: 400 });
      const juego = await em.getRepository(Juego).findOneBy({ idjuego: Number(req.body.idjuego) });
      if (!juego) throw Object.assign(new Error("Juego no encontrado"), { status: 404 });
      nivel.juego = juego;
    }

    await em.getRepository(Nivel).save(nivel);

    if (gruposInput !== null) {
      // Borrar botellas, bloqueogrupos y grupos existentes
      for (const g of nivel.grupos) {
        if (g.botellas?.length) await em.getRepository(Botella).remove(g.botellas);
        if (g.bloqueoGrupos?.length) await em.getRepository(BloqueoGrupo).remove(g.bloqueoGrupos);
      }
      if (nivel.grupos.length) await em.getRepository(Grupo).remove(nivel.grupos);

      await crearGrupos(em, nivel, gruposInput as any[]);
    }

    res.json({ idnivel: nivel.idnivel });
  }).catch((err: any) => {
    if (!res.headersSent) {
      if (err.code === "23505") return res.status(409).json({ error: "Ya existe un nivel con ese número en este juego" });
      res.status(err.status ?? 500).json({ error: err.message });
    }
  });
});

// POST /niveles/:id/resolver — delega al solver Python
router.post("/:id/resolver", async (req: Request, res: Response) => {
  const idnivel = Number(req.params.id);
  const asyncMode = req.query.async === "true";

  const nivel = await AppDataSource.getRepository(Nivel).findOneBy({ idnivel });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });

  const solverUrl = `http://localhost:8001/resolver/${idnivel}${asyncMode ? "?async_mode=true" : ""}`;
  try {
    const resp = await fetch(solverUrl, { method: "POST" });
    const data = await resp.json();
    res.status(resp.ok ? 200 : 502).json(data);
  } catch {
    res.status(503).json({ error: "Solver no disponible. ¿Está corriendo el servicio Python?" });
  }
});

// GET /niveles/:id/solucion — devuelve la solución guardada
router.get("/:id/solucion", async (req: Request, res: Response) => {
  const idnivel = Number(req.params.id);
  try {
    const resp = await fetch(`http://localhost:8001/solucion/${idnivel}`);
    if (resp.status === 404) return res.status(404).json({ error: "Sin solución guardada" });
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(503).json({ error: "Solver no disponible" });
  }
});

// DELETE /niveles/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const nivel = await AppDataSource.getRepository(Nivel).findOne({
    where: { idnivel: Number(req.params.id) },
    relations: ["grupos", "grupos.botellas", "grupos.bloqueoGrupos"],
  });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });

  await AppDataSource.transaction(async (em) => {
    for (const g of nivel.grupos ?? []) {
      if (g.botellas?.length) await em.getRepository(Botella).remove(g.botellas);
      if (g.bloqueoGrupos?.length) await em.getRepository(BloqueoGrupo).remove(g.bloqueoGrupos);
    }
    if (nivel.grupos?.length) await em.getRepository(Grupo).remove(nivel.grupos);
    await em.getRepository(Nivel).remove(nivel);
  });

  res.status(204).send();
});

export default router;
