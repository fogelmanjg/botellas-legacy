import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTipoBloqueo1745553600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bloqueo ADD COLUMN tipo VARCHAR(20)`);
    await queryRunner.query(`UPDATE bloqueo SET tipo = 'lona_color' WHERE idbloqueo = 1`);
    await queryRunner.query(`UPDATE bloqueo SET tipo = 'lona'       WHERE idbloqueo = 2`);
    await queryRunner.query(`UPDATE bloqueo SET tipo = 'barrera'    WHERE idbloqueo = 3`);
    await queryRunner.query(`UPDATE bloqueo SET tipo = 'traba'      WHERE idbloqueo = 4`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bloqueo DROP COLUMN tipo`);
  }
}
