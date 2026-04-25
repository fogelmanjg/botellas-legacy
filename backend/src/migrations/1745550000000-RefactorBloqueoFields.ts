import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorBloqueoFields1745550000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bloqueo ADD COLUMN bloquea TEXT`);
    await queryRunner.query(`ALTER TABLE bloqueo ADD COLUMN desbloquea TEXT`);

    // Migrar datos existentes desde propiedades JSONB
    await queryRunner.query(`
      UPDATE bloqueo
      SET
        bloquea   = propiedades->>'bloqueo',
        desbloquea = propiedades->>'desbloqueo'
      WHERE propiedades IS NOT NULL
    `);

    // Marcar barrera como agrupadora
    await queryRunner.query(`UPDATE bloqueo SET agrupa = TRUE WHERE nombre = 'barrera'`);

    await queryRunner.query(`ALTER TABLE bloqueo DROP COLUMN propiedades`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bloqueo ADD COLUMN propiedades JSONB`);
    await queryRunner.query(`ALTER TABLE bloqueo DROP COLUMN desbloquea`);
    await queryRunner.query(`ALTER TABLE bloqueo DROP COLUMN bloquea`);
  }
}
