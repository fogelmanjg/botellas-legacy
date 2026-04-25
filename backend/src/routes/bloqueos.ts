import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Bloqueo } from "../entity/Bloqueo";

const router = Router();
const repo = () => AppDataSource.getRepository(Bloqueo);

// GET /bloqueos
router.get("/", async (_req: Request, res: Response) => {
  const bloqueos = await repo().find({ order: { nombre: "ASC" } });
  res.json(bloqueos);
});

// GET /bloqueos/:id
router.get("/:id", async (req: Request, res: Response) => {
  const bloqueo = await repo().findOneBy({ idbloqueo: Number(req.params.id) });
  if (!bloqueo) return res.status(404).json({ error: "Bloqueo no encontrado" });
  res.json(bloqueo);
});

// POST /bloqueos
router.post("/", async (req: Request, res: Response) => {
  const { nombre, tipo, bloquea, desbloquea, entrada, salida, vista, css } = req.body;
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "nombre es requerido" });
  }
  const bloqueo = repo().create({
    nombre: nombre.trim(),
    tipo: tipo ?? null,
    bloquea: bloquea?.trim() || null,
    desbloquea: desbloquea ?? "N",
    entrada: entrada ?? "N",
    salida: salida ?? "N",
    vista: vista ?? "N",
    css: css ?? "S",
  });
  await repo().save(bloqueo);
  res.status(201).json(bloqueo);
});

// PUT /bloqueos/:id
router.put("/:id", async (req: Request, res: Response) => {
  const bloqueo = await repo().findOneBy({ idbloqueo: Number(req.params.id) });
  if (!bloqueo) return res.status(404).json({ error: "Bloqueo no encontrado" });
  if (typeof req.body.nombre === "string") bloqueo.nombre = req.body.nombre.trim();
  if ("tipo"       in req.body) bloqueo.tipo       = req.body.tipo ?? null;
  if ("bloquea"    in req.body) bloqueo.bloquea    = req.body.bloquea?.trim() || null;
  if ("desbloquea" in req.body) bloqueo.desbloquea = req.body.desbloquea ?? "N";
  if ("entrada"    in req.body) bloqueo.entrada    = req.body.entrada ?? "N";
  if ("salida"     in req.body) bloqueo.salida     = req.body.salida  ?? "N";
  if ("vista"      in req.body) bloqueo.vista      = req.body.vista   ?? "N";
  if ("css"        in req.body) bloqueo.css        = req.body.css     ?? "S";
  await repo().save(bloqueo);
  res.json(bloqueo);
});

// DELETE /bloqueos/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const bloqueo = await repo().findOneBy({ idbloqueo: Number(req.params.id) });
  if (!bloqueo) return res.status(404).json({ error: "Bloqueo no encontrado" });
  await repo().remove(bloqueo);
  res.status(204).send();
});

export default router;
