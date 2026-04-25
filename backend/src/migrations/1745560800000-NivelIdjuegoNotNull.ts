import { MigrationInterface, QueryRunner } from "typeorm";

export class NivelIdjuegoNotNull1745560800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Requiere que no haya filas con idjuego IS NULL antes de correr
    await queryRunner.query(`ALTER TABLE nivel ALTER COLUMN idjuego SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE nivel
        DROP CONSTRAINT nivel_idjuego_fkey,
        ADD  CONSTRAINT nivel_idjuego_fkey
             FOREIGN KEY (idjuego) REFERENCES juego(idjuego) ON DELETE RESTRICT
    `);
    // Reemplazar el índice parcial por uno completo (idjuego ya no puede ser NULL)
    await queryRunner.query(`DROP INDEX IF EXISTS nivel_idjuego_numeronivel_uidx`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX nivel_idjuego_numeronivel_uidx ON nivel(idjuego, numeronivel)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS nivel_idjuego_numeronivel_uidx`);
    await queryRunner.query(`
      ALTER TABLE nivel
        DROP CONSTRAINT nivel_idjuego_fkey,
        ADD  CONSTRAINT nivel_idjuego_fkey
             FOREIGN KEY (idjuego) REFERENCES juego(idjuego) ON DELETE SET NULL
    `);
    await queryRunner.query(`ALTER TABLE nivel ALTER COLUMN idjuego DROP NOT NULL`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX nivel_idjuego_numeronivel_uidx
        ON nivel(idjuego, numeronivel)
        WHERE idjuego IS NOT NULL
    `);
  }
}
