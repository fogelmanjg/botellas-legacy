import "reflect-metadata";
import { DataSource } from "typeorm";
import { Juego } from "./entity/Juego";
import { Bloqueo } from "./entity/Bloqueo";
import { Nivel } from "./entity/Nivel";
import { Grupo } from "./entity/Grupo";
import { Botella } from "./entity/Botella";
import { BloqueoGrupo } from "./entity/BloqueoGrupo";
import { Solucion } from "./entity/Solucion";
import { Estrategia } from "./entity/Estrategia";
import { InitialSchema1745452800000 } from "./migrations/1745452800000-InitialSchema";
import { AddFilaBotella1745539200000 } from "./migrations/1745539200000-AddFilaBotella";
import { AddColorBotella1745542800000 } from "./migrations/1745542800000-AddColorBotella";
import { AddAgrupaBloqueoPropiedades1745546400000 } from "./migrations/1745546400000-AddAgrupaBloqueoPropiedades";
import { RefactorBloqueoFields1745550000000 } from "./migrations/1745550000000-RefactorBloqueoFields";
import { AddTipoBloqueo1745553600000 } from "./migrations/1745553600000-AddTipoBloqueo";
import { UniqueNivelPorJuego1745557200000 } from "./migrations/1745557200000-UniqueNivelPorJuego";
import { NivelIdjuegoNotNull1745560800000 } from "./migrations/1745560800000-NivelIdjuegoNotNull";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "botellas",
  synchronize: false,
  logging: false,
  entities: [Juego, Bloqueo, Nivel, Grupo, Botella, BloqueoGrupo, Solucion, Estrategia],
  migrations: [
    InitialSchema1745452800000,
    AddFilaBotella1745539200000,
    AddColorBotella1745542800000,
    AddAgrupaBloqueoPropiedades1745546400000,
    RefactorBloqueoFields1745550000000,
    AddTipoBloqueo1745553600000,
    UniqueNivelPorJuego1745557200000,
    NivelIdjuegoNotNull1745560800000,
  ],
});
