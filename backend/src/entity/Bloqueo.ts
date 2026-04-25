import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Botella } from "./Botella";
import { BloqueoGrupo } from "./BloqueoGrupo";

@Entity("bloqueo")
export class Bloqueo {
  @PrimaryGeneratedColumn({ name: "idbloqueo" })
  idbloqueo!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  tipo!: string | null;

  @Column({ type: "text", nullable: true })
  bloquea!: string | null;

  // Código de condición de desbloqueo: N, G (grupo), C (color), S (cualquiera), A (adyacente en grupo)
  @Column({ type: "text", nullable: true, default: "N" })
  desbloquea!: string | null;

  // S=bloquea entrada, N=no bloquea, C=bloquea salvo color específico (ver botella.color)
  @Column({ type: "varchar", default: "N" })
  entrada!: string;

  // S=bloquea salida, N=no bloquea
  @Column({ type: "varchar", default: "N" })
  salida!: string;

  // S=piezas visibles, N=ocultas
  @Column({ type: "varchar", default: "N" })
  vista!: string;

  @Column({ type: "varchar", default: "S" })
  css!: string;

  @OneToMany(() => Botella, (b) => b.bloqueo)
  botellas!: Botella[];

  @OneToMany(() => BloqueoGrupo, (bg) => bg.bloqueo)
  bloqueoGrupos!: BloqueoGrupo[];
}
