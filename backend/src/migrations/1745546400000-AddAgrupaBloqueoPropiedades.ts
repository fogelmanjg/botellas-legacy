import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgrupaBloqueoPropiedades1745546400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bloqueo ADD COLUMN agrupa BOOLEAN NOT NULL DEFAULT FALSE`);
    await queryRunner.query(`ALTER TABLE botella ADD COLUMN propiedades_bloqueo JSONB`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE botella DROP COLUMN propiedades_bloqueo`);
    await queryRunner.query(`ALTER TABLE bloqueo DROP COLUMN agrupa`);
  }
}
