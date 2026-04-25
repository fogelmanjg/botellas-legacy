import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Nivel } from "../entity/Nivel";
import { Botella } from "../entity/Botella";
import { Juego } from "../entity/Juego";
import { Bloqueo } from "../entity/Bloqueo";

const router = Router();

// Valida un valor de espacio: null=vacío | 'x'=oculto | 'A'-'Z'=color
// Devuelve el valor normalizado, o undefined si es inválido
function validarEspacio(v: unknown): string | null | undefined {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "") return null;
  if (s === "x") return "x";
  if (/^[A-Z]$/.test(s)) return s;
  if (/^[a-z]$/.test(s)) return s.toUpperCase(); // normalizar minúsculas
  return undefined; // valor inválido
}

// Convierte espacio1-4 en un array [e1, e2, e3, e4] para el frontend y el solver
function espaciosArray(b: Botella): (string | null)[] {
  return [b.espacio1, b.espacio2, b.espacio3, b.espacio4];
}

// GET /niveles?idjuego=N — lista niveles (sin botellas, solo metadata)
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

// GET /niveles/:id — detalle completo con botellas ordenadas
router.get("/:id", async (req: Request, res: Response) => {
  const nivel = await AppDataSource.getRepository(Nivel).findOne({
    where: { idnivel: Number(req.params.id) },
    relations: ["juego", "botellas", "botellas.bloqueo"],
    order: { botellas: { numerobotella: "ASC" } },
  });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });

  // Añadimos el array espacios a cada botella para comodidad del frontend/solver
  const botellas = nivel.botellas.map((b) => ({
    idbotella: b.idbotella,
    numerobotella: b.numerobotella,
    bloqueo: b.bloqueo,
    espacios: espaciosArray(b),
  }));

  res.json({ ...nivel, botellas });
});

// POST /niveles — crea un nivel con sus botellas
// Body: { idjuego?, numeronivel, capacidadextra?, botellas: [{numerobotella, idbloqueo?, espacio1..4}] }
router.post("/", async (req: Request, res: Response) => {
  const { idjuego, numeronivel, capacidadextra = 0, botellas: botellasInput } = req.body;

  if (typeof numeronivel !== "number") {
    return res.status(400).json({ error: "numeronivel debe ser un número" });
  }
  if (typeof capacidadextra !== "number" || capacidadextra < 0) {
    return res.status(400).json({ error: "capacidadextra debe ser un número >= 0" });
  }
  if (!Array.isArray(botellasInput) || botellasInput.length === 0) {
    return res.status(400).json({ error: "botellas debe ser un array no vacío" });
  }

  // Validar cada botella
  for (const [i, b] of botellasInput.entries()) {
    if (typeof b.numerobotella !== "number") {
      return res.status(400).json({ error: `botellas[${i}].numerobotella debe ser un número` });
    }
    for (const campo of ["espacio1", "espacio2", "espacio3", "espacio4"] as const) {
      if (validarEspacio(b[campo]) === undefined) {
        return res.status(400).json({
          error: `botellas[${i}].${campo} inválido — use null, 'x' u otra letra A-Z`,
        });
      }
    }
  }

  // Verificar que numerobotella sea único dentro del nivel
  const numeros: number[] = botellasInput.map((b: { numerobotella: number }) => b.numerobotella);
  if (new Set(numeros).size !== numeros.length) {
    return res.status(400).json({ error: "numerobotella debe ser único por nivel" });
  }

  await AppDataSource.transaction(async (em) => {
    // Resolver juego si viene
    let juego: Juego | null = null;
    if (idjuego != null) {
      juego = await em.getRepository(Juego).findOneBy({ idjuego: Number(idjuego) });
      if (!juego) throw Object.assign(new Error("Juego no encontrado"), { status: 404 });
    }

    const nivel = em.getRepository(Nivel).create({ juego, numeronivel, capacidadextra });
    await em.getRepository(Nivel).save(nivel);

    for (const b of botellasInput) {
      let bloqueo: Bloqueo | null = null;
      if (b.idbloqueo != null) {
        bloqueo = await em.getRepository(Bloqueo).findOneBy({ idbloqueo: Number(b.idbloqueo) });
        if (!bloqueo) throw Object.assign(new Error("Bloqueo no encontrado"), { status: 404 });
      }

      const botella = em.getRepository(Botella).create({
        nivel,
        numerobotella: b.numerobotella,
        bloqueo,
        espacio1: validarEspacio(b.espacio1) ?? null,
        espacio2: validarEspacio(b.espacio2) ?? null,
        espacio3: validarEspacio(b.espacio3) ?? null,
        espacio4: validarEspacio(b.espacio4) ?? null,
      });
      await em.getRepository(Botella).save(botella);
    }

    res.status(201).json({ idnivel: nivel.idnivel });
  }).catch((err: Error & { status?: number }) => {
    if (!res.headersSent) {
      res.status(err.status ?? 500).json({ error: err.message });
    }
  });
});

// PUT /niveles/:id — actualizar metadata del nivel
router.put("/:id", async (req: Request, res: Response) => {
  const nivel = await AppDataSource.getRepository(Nivel).findOneBy({ idnivel: Number(req.params.id) });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });

  if (typeof req.body.numeronivel === "number") nivel.numeronivel = req.body.numeronivel;
  if (typeof req.body.capacidadextra === "number") nivel.capacidadextra = req.body.capacidadextra;

  if ("idjuego" in req.body) {
    if (req.body.idjuego == null) {
      nivel.juego = null;
    } else {
      const juego = await AppDataSource.getRepository(Juego).findOneBy({ idjuego: Number(req.body.idjuego) });
      if (!juego) return res.status(404).json({ error: "Juego no encontrado" });
      nivel.juego = juego;
    }
  }

  await AppDataSource.getRepository(Nivel).save(nivel);
  res.json(nivel);
});

// PUT /niveles/:id/botellas/:idbotella — actualizar espacios o bloqueo de una botella
router.put("/:id/botellas/:idbotella", async (req: Request, res: Response) => {
  const botella = await AppDataSource.getRepository(Botella).findOne({
    where: {
      idbotella: Number(req.params.idbotella),
      nivel: { idnivel: Number(req.params.id) },
    },
    relations: ["bloqueo"],
  });
  if (!botella) return res.status(404).json({ error: "Botella no encontrada" });

  for (const campo of ["espacio1", "espacio2", "espacio3", "espacio4"] as const) {
    if (campo in req.body) {
      const v = validarEspacio(req.body[campo]);
      if (v === undefined) {
        return res.status(400).json({ error: `${campo} inválido — use null, 'x' u otra letra A-Z` });
      }
      botella[campo] = v;
    }
  }

  if ("idbloqueo" in req.body) {
    if (req.body.idbloqueo == null) {
      botella.bloqueo = null;
    } else {
      const bloqueo = await AppDataSource.getRepository(Bloqueo).findOneBy({ idbloqueo: Number(req.body.idbloqueo) });
      if (!bloqueo) return res.status(404).json({ error: "Bloqueo no encontrado" });
      botella.bloqueo = bloqueo;
    }
  }

  await AppDataSource.getRepository(Botella).save(botella);
  res.json({ ...botella, espacios: espaciosArray(botella) });
});

// DELETE /niveles/:id — borra el nivel, sus botellas y su solución (CASCADE)
router.delete("/:id", async (req: Request, res: Response) => {
  const nivel = await AppDataSource.getRepository(Nivel).findOneBy({ idnivel: Number(req.params.id) });
  if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });
  await AppDataSource.getRepository(Nivel).remove(nivel);
  res.status(204).send();
});

export default router;
