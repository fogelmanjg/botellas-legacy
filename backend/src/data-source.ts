import "reflect-metadata";
import { DataSource } from "typeorm";
import { Juego } from "./entity/Juego";
import { Bloqueo } from "./entity/Bloqueo";
import { Nivel } from "./entity/Nivel";
import { Botella } from "./entity/Botella";
import { Solucion } from "./entity/Solucion";
import { InitialSchema1745452800000 } from "./migrations/1745452800000-InitialSchema";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "botellas",
  synchronize: false,
  logging: false,
  entities: [Juego, Bloqueo, Nivel, Botella, Solucion],
  migrations: [InitialSchema1745452800000],
});
