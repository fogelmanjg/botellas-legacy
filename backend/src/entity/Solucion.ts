import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Nivel } from "./Nivel";

@Entity("solucion")
export class Solucion {
  @PrimaryColumn({ name: "idnivel" })
  idnivel!: number;

  @OneToOne(() => Nivel, (n: Nivel) => n.solucion)
  @JoinColumn({ name: "idnivel" })
  nivel!: Nivel;

  @Column({ type: "jsonb", nullable: true })
  pasos!: object | null;

  @Column({ name: "fechacalculo", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechacalculo!: Date;
}
