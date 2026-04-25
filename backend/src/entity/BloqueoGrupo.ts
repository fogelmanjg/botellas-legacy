import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Grupo } from "./Grupo";
import { Bloqueo } from "./Bloqueo";

@Entity("bloqueogrupo")
export class BloqueoGrupo {
  @PrimaryGeneratedColumn({ name: "idbloqueogrupo" })
  idbloqueogrupo!: number;

  @ManyToOne(() => Grupo, (g) => g.bloqueoGrupos)
  @JoinColumn({ name: "idgrupo" })
  grupo!: Grupo;

  @ManyToOne(() => Bloqueo, (b) => b.bloqueoGrupos)
  @JoinColumn({ name: "idbloqueo" })
  bloqueo!: Bloqueo;
}
