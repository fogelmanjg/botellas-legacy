import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColorBotella1745542800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE botella ADD COLUMN color CHAR(1)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE botella DROP COLUMN color`);
  }
}
