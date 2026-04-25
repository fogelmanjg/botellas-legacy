import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Nivel } from "./Nivel";
import { Botella } from "./Botella";
import { BloqueoGrupo } from "./BloqueoGrupo";

@Entity("grupo")
export class Grupo {
  @PrimaryGeneratedColumn({ name: "idgrupo" })
  idgrupo!: number;

  @ManyToOne(() => Nivel, (n) => n.grupos)
  @JoinColumn({ name: "idnivel" })
  nivel!: Nivel;

  @Column({ name: "numerogrupo" })
  numerogrupo!: number;

  // Dirección de entrada: 1=arriba, 2=derecha, 3=abajo, 4=izquierda
  @Column()
  entrada!: number;

  @OneToMany(() => Botella, (b) => b.grupo)
  botellas!: Botella[];

  @OneToMany(() => BloqueoGrupo, (bg) => bg.grupo)
  bloqueoGrupos!: BloqueoGrupo[];
}
