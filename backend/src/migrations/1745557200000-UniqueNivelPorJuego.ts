import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueNivelPorJuego1745557200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Índice único parcial: dentro del mismo juego, numeronivel no se repite.
    // WHERE idjuego IS NOT NULL: los niveles sin juego asignado no participan.
    await queryRunner.query(`
      CREATE UNIQUE INDEX nivel_idjuego_numeronivel_uidx
        ON nivel(idjuego, numeronivel)
        WHERE idjuego IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS nivel_idjuego_numeronivel_uidx`);
  }
}
