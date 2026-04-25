import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Juego } from "./Juego";
import { Grupo } from "./Grupo";
import { Solucion } from "./Solucion";

@Entity("nivel")
export class Nivel {
  @PrimaryGeneratedColumn({ name: "idnivel" })
  idnivel!: number;

  @ManyToOne(() => Juego, (j) => j.niveles, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "idjuego" })
  juego!: Juego | null;

  @Column({ name: "numeronivel" })
  numeronivel!: number;

  @Column({ name: "capacidadextra", default: 0 })
  capacidadextra!: number;

  @Column({ name: "estadohash", type: "varchar", length: 64, nullable: true })
  estadohash!: string | null;

  // N=no validado, S=validado
  @Column({ type: "varchar", default: "N" })
  validado!: string;

  @Column({ type: "varchar", nullable: true })
  subidopor!: string | null;

  @OneToMany(() => Grupo, (g) => g.nivel)
  grupos!: Grupo[];

  @OneToOne(() => Solucion, (s) => s.nivel)
  solucion!: Solucion | null;
}
