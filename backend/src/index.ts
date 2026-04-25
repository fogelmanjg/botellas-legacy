import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import juegosRouter from "./routes/juegos";
import bloqueosRouter from "./routes/bloqueos";
import nivelesRouter from "./routes/niveles";
import estrategiasRouter from "./routes/estrategias";

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    app.get("/health", (_req, res) => res.json({ ok: true }));

    app.use("/juegos", juegosRouter);
    app.use("/bloqueos", bloqueosRouter);
    app.use("/niveles", nivelesRouter);
    app.use("/estrategias", estrategiasRouter);

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => console.log(`Server listening on ${port}`));
  })
  .catch((err) => {
    console.error("DataSource initialization error:", err);
    process.exit(1);
  });
