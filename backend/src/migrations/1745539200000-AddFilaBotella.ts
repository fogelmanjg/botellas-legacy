import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFilaBotella1745539200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE botella ADD COLUMN fila INT NOT NULL DEFAULT 1
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE botella DROP COLUMN fila`);
  }
}
