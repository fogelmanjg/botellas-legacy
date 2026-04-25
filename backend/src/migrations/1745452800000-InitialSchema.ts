import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745452800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas del scaffold anterior si existen
    await queryRunner.query(`DROP TABLE IF EXISTS bottle CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS nivel CASCADE`);

    await queryRunner.query(`
      CREATE TABLE juego (
        idjuego  SERIAL PRIMARY KEY,
        nombre   VARCHAR(200) NOT NULL,
        editor   VARCHAR(200)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE bloqueo (
        idbloqueo   SERIAL PRIMARY KEY,
        nombre      VARCHAR(100) NOT NULL,
        propiedades JSONB
      )
    `);

    await queryRunner.query(`
      CREATE TABLE nivel (
        idnivel        SERIAL PRIMARY KEY,
        idjuego        INT REFERENCES juego(idjuego) ON DELETE SET NULL,
        numeronivel    INT NOT NULL,
        capacidadextra INT NOT NULL DEFAULT 0,
        estadohash     VARCHAR(64)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE botella (
        idbotella     SERIAL PRIMARY KEY,
        idnivel       INT NOT NULL REFERENCES nivel(idnivel) ON DELETE CASCADE,
        numerobotella INT NOT NULL,
        idbloqueo     INT REFERENCES bloqueo(idbloqueo) ON DELETE SET NULL,
        espacio1      CHAR(1),
        espacio2      CHAR(1),
        espacio3      CHAR(1),
        espacio4      CHAR(1)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE solucion (
        idnivel      INT PRIMARY KEY REFERENCES nivel(idnivel) ON DELETE CASCADE,
        pasos        JSONB,
        fechacalculo TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS solucion CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS botella CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS nivel CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS bloqueo CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS juego CASCADE`);
  }
}
