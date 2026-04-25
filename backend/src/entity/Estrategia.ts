import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("estrategia")
export class Estrategia {
  // Nota: columna en DB se llama "idestategia" (sin segunda 'r'), respetamos el nombre original
  @PrimaryGeneratedColumn({ name: "idestategia" })
  idestategia!: number;

  @Column({ length: 50 })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string | null;

  @Column({ default: 999 })
  peso!: number;

  // S=activa, N=inactiva
  @Column({ type: "char", length: 1, default: "S" })
  activa!: string;
}
