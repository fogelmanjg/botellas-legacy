import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Juego } from "../entity/Juego";

const router = Router();
const repo = () => AppDataSource.getRepository(Juego);

// GET /juegos — lista todos los juegos
router.get("/", async (_req: Request, res: Response) => {
  const juegos = await repo().find({ order: { nombre: "ASC" } });
  res.json(juegos);
});

// GET /juegos/:id — detalle de un juego con sus niveles
router.get("/:id", async (req: Request, res: Response) => {
  const juego = await repo().findOne({
    where: { idjuego: Number(req.params.id) },
    relations: ["niveles"],
    order: { niveles: { numeronivel: "ASC" } },
  });
  if (!juego) return res.status(404).json({ error: "Juego no encontrado" });
  res.json(juego);
});

// POST /juegos — crear un juego
router.post("/", async (req: Request, res: Response) => {
  const { nombre, editor } = req.body;
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "nombre es requerido" });
  }
  const juego = repo().create({ nombre: nombre.trim(), editor: editor?.trim() ?? null });
  await repo().save(juego);
  res.status(201).json(juego);
});

// PUT /juegos/:id — actualizar nombre o editor
router.put("/:id", async (req: Request, res: Response) => {
  const juego = await repo().findOneBy({ idjuego: Number(req.params.id) });
  if (!juego) return res.status(404).json({ error: "Juego no encontrado" });
  if (typeof req.body.nombre === "string") juego.nombre = req.body.nombre.trim();
  if ("editor" in req.body) juego.editor = req.body.editor?.trim() ?? null;
  await repo().save(juego);
  res.json(juego);
});

// DELETE /juegos/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const juego = await repo().findOneBy({ idjuego: Number(req.params.id) });
  if (!juego) return res.status(404).json({ error: "Juego no encontrado" });
  await repo().remove(juego);
  res.status(204).send();
});

export default router;
