import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Botella } from "./Botella";

@Entity("bloqueo")
export class Bloqueo {
  @PrimaryGeneratedColumn({ name: "idbloqueo" })
  idbloqueo!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: "jsonb", nullable: true })
  propiedades!: object | null;

  @OneToMany(() => Botella, (b) => b.bloqueo)
  botellas!: Botella[];
}
