import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { Bottle } from "./entity/Bottle";
import { Nivel } from "./entity/Nivel";

const app = express();
app.use(express.json());

  AppDataSource.initialize().then(async () => {
    const bottleRepo = AppDataSource.getRepository(Bottle);
    const nivelRepo = AppDataSource.getRepository(Nivel);

    app.get("/health", (_req, res) => res.json({ ok: true }));

    // Create a nivel and its bottles
    app.post("/levels", async (req, res) => {
      const { espaciosbotella0, cantidadbotellas } = req.body;
      if (typeof espaciosbotella0 !== "number" || typeof cantidadbotellas !== "number") {
        return res.status(400).json({ error: "espaciosbotella0 and cantidadbotellas must be numbers" });
      }
      const nivel = nivelRepo.create({ espaciosbotella0, cantidadbotellas });
      await nivelRepo.save(nivel);

      // create bottle 0 (special) - use espacio1..espacio4 but only first N are relevant
      const special = bottleRepo.create({ nivel, posicion: 0, espacio1: null, espacio2: null, espacio3: null, espacio4: null });
      await bottleRepo.save(special);

      // create normal bottles 1..cantidadbotellas
      const created: Bottle[] = [special];
      for (let i = 1; i <= cantidadbotellas; i++) {
        const b = bottleRepo.create({ nivel, posicion: i, espacio1: null, espacio2: null, espacio3: null, espacio4: null });
        await bottleRepo.save(b);
        created.push(b);
      }

      res.json({ nivel, bottles: created });
    });

    app.get("/levels", async (_req, res) => {
      const list = await nivelRepo.find({ relations: ["bottles"] });
      res.json(list);
    });

    app.get("/bottles", async (_req, res) => {
      const list = await bottleRepo.find({ relations: ["nivel"] });
      res.json(list);
    });

    // Validate allowed space values: null, uppercase A-Z, or '?'
    function normalizeValue(v: any): string | null {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (s === "") return null;
      if (s === "?") return "?";
      if (/^[A-Z]$/.test(s)) return s;
      // try uppercase single char letter
      if (/^[a-z]$/.test(s)) return s.toUpperCase();
      return null;
    }

    // Set a specific space value on a bottle
    app.post("/bottles/:id/space", async (req, res) => {
      const id = Number(req.params.id);
      const { space, value } = req.body; // space: 1..4
      if (![1,2,3,4].includes(Number(space))) return res.status(400).json({ error: "space must be 1..4" });
      const v = normalizeValue(value);
      if (value !== null && v === null) return res.status(400).json({ error: "value must be null, ?, or letter A-Z" });
      const b = await bottleRepo.findOne({ where: { idbotella: id } });
      if (!b) return res.status(404).json({ error: "bottle not found" });
      const field = `espacio${space}` as keyof typeof b;
      // @ts-ignore
      b[field] = v;
      await bottleRepo.save(b);
      res.json(b);
    });

    // Move a piece from one bottle/space to another
    app.post("/move", async (req, res) => {
      const { fromId, fromSpace, toId, toSpace } = req.body;
      if (![1,2,3,4].includes(Number(fromSpace)) || ![1,2,3,4].includes(Number(toSpace))) {
        return res.status(400).json({ error: "fromSpace/toSpace must be 1..4" });
      }
      const from = await bottleRepo.findOne({ where: { idbotella: Number(fromId) } });
      const to = await bottleRepo.findOne({ where: { idbotella: Number(toId) } });
      if (!from || !to) return res.status(404).json({ error: "from or to bottle not found" });
      const fField = `espacio${fromSpace}` as keyof typeof from;
      const tField = `espacio${toSpace}` as keyof typeof to;
      // @ts-ignore
      const val = from[fField];
      if (val === null || val === undefined) return res.status(400).json({ error: "source space is empty" });
      // destination must be empty
      // @ts-ignore
      if (to[tField] !== null && to[tField] !== undefined) return res.status(400).json({ error: "destination space is not empty" });

      // perform move
      // @ts-ignore
      to[tField] = val;
      // @ts-ignore
      from[fField] = null;
      await bottleRepo.save([from, to]);
      res.json({ from, to });
    });

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => console.log(`Server listening on ${port}`));
  }).catch(err => {
    console.error("DataSource initialization error:", err);
    process.exit(1);
  });
