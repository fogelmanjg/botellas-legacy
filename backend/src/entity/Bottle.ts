import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Nivel } from "./Nivel";

@Entity()
export class Bottle {
  @PrimaryGeneratedColumn({ name: "idbotella" })
  idbotella: number;

  @ManyToOne(() => Nivel, (nivel) => nivel.bottles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idnivel" })
  nivel: Nivel;

  @Column("int")
  posicion: number;

  @Column("text", { nullable: true })
  espacio1: string | null;

  @Column("text", { nullable: true })
  espacio2: string | null;

  @Column("text", { nullable: true })
  espacio3: string | null;

  @Column("text", { nullable: true })
  espacio4: string | null;
}
