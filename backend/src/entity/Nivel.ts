import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Bottle } from "./Bottle";

@Entity()
export class Nivel {
  @PrimaryGeneratedColumn({ name: "idnivel" })
  idnivel: number;

  @Column("int")
  espaciosbotella0: number;

  @Column("int")
  cantidadbotellas: number;

  @OneToMany(() => Bottle, (b) => b.nivel)
  bottles: Bottle[];
}
