import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Nivel } from "./Nivel";

@Entity("juego")
export class Juego {
  @PrimaryGeneratedColumn({ name: "idjuego" })
  idjuego!: number;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  editor!: string | null;

  @OneToMany(() => Nivel, (n) => n.juego)
  niveles!: Nivel[];
}
