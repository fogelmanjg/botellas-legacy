import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Grupo } from "./Grupo";
import { Bloqueo } from "./Bloqueo";

@Entity("botella")
export class Botella {
  @PrimaryGeneratedColumn({ name: "idbotella" })
  idbotella!: number;

  @ManyToOne(() => Grupo, (g) => g.botellas)
  @JoinColumn({ name: "idgrupo" })
  grupo!: Grupo;

  @Column({ name: "numerobotella" })
  numerobotella!: number;

  // Bloqueo individual (lona_color, conos). El bloqueo grupal va en bloqueogrupo.
  @ManyToOne(() => Bloqueo, (bl) => bl.botellas, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "idbloqueo" })
  bloqueo!: Bloqueo | null;

  // Color específico asociado al bloqueo: unlock color en lona_color, restricción en entrada=C
  @Column({ type: "char", length: 1, nullable: true })
  color!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio1!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio2!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio3!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio4!: string | null;
}
