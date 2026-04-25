import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Nivel } from "./Nivel";
import { Bloqueo } from "./Bloqueo";

@Entity("botella")
export class Botella {
  @PrimaryGeneratedColumn({ name: "idbotella" })
  idbotella!: number;

  @ManyToOne(() => Nivel, (n: Nivel) => n.botellas, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idnivel" })
  nivel!: Nivel;

  @Column({ name: "numerobotella" })
  numerobotella!: number;

  @ManyToOne(() => Bloqueo, (bl: Bloqueo) => bl.botellas, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "idbloqueo" })
  bloqueo!: Bloqueo | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio1!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio2!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio3!: string | null;

  @Column({ type: "char", length: 1, nullable: true })
  espacio4!: string | null;
}
