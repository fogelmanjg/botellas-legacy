import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Juego } from "./Juego";
import { Botella } from "./Botella";
import { Solucion } from "./Solucion";

@Entity("nivel")
export class Nivel {
  @PrimaryGeneratedColumn({ name: "idnivel" })
  idnivel!: number;

  @ManyToOne(() => Juego, (j: Juego) => j.niveles, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "idjuego" })
  juego!: Juego | null;

  @Column({ name: "numeronivel" })
  numeronivel!: number;

  // 0 = sin botella extra; >0 = cantidad de espacios de la botella extra
  @Column({ name: "capacidadextra", default: 0 })
  capacidadextra!: number;

  // Hash normalizado del estado inicial para detectar niveles duplicados
  @Column({ name: "estadohash", type: "varchar", length: 64, nullable: true })
  estadohash!: string | null;

  @OneToMany(() => Botella, (b: Botella) => b.nivel)
  botellas!: Botella[];

  @OneToOne(() => Solucion, (s: Solucion) => s.nivel)
  solucion!: Solucion | null;
}
