import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Estrategia } from "../entity/Estrategia";

const router = Router();
const repo = () => AppDataSource.getRepository(Estrategia);

// GET /estrategias
router.get("/", async (_req: Request, res: Response) => {
  const lista = await repo().find({ order: { peso: "ASC", nombre: "ASC" } });
  res.json(lista);
});

// GET /estrategias/:id
router.get("/:id", async (req: Request, res: Response) => {
  const e = await repo().findOneBy({ idestategia: Number(req.params.id) });
  if (!e) return res.status(404).json({ error: "Estrategia no encontrada" });
  res.json(e);
});

// POST /estrategias
router.post("/", async (req: Request, res: Response) => {
  const { nombre, descripcion, peso, activa } = req.body;
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "nombre es requerido" });
  }
  const e = repo().create({
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || null,
    peso: typeof peso === "number" ? peso : 999,
    activa: activa === "N" ? "N" : "S",
  });
  await repo().save(e);
  res.status(201).json(e);
});

// PUT /estrategias/:id
router.put("/:id", async (req: Request, res: Response) => {
  const e = await repo().findOneBy({ idestategia: Number(req.params.id) });
  if (!e) return res.status(404).json({ error: "Estrategia no encontrada" });
  if (typeof req.body.nombre === "string") e.nombre = req.body.nombre.trim();
  if ("descripcion" in req.body) e.descripcion = req.body.descripcion?.trim() || null;
  if (typeof req.body.peso === "number") e.peso = req.body.peso;
  if ("activa" in req.body) e.activa = req.body.activa === "N" ? "N" : "S";
  await repo().save(e);
  res.json(e);
});

// DELETE /estrategias/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const e = await repo().findOneBy({ idestategia: Number(req.params.id) });
  if (!e) return res.status(404).json({ error: "Estrategia no encontrada" });
  await repo().remove(e);
  res.status(204).send();
});

export default router;
