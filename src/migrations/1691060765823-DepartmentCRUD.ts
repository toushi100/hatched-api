import { MigrationInterface, QueryRunner } from "typeorm";

export class DepartmentCRUD1691060765823 implements MigrationInterface {
    name = "DepartmentCRUD1691060765823";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "department" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "department_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_28a598987c3302c0b4dfc71f868" PRIMARY KEY ("department_id"))`,
        );
        await queryRunner.query(`ALTER TABLE "employee" ADD "department_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "employee" ADD CONSTRAINT "FK_d62835db8c0aec1d18a5a927549" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_d62835db8c0aec1d18a5a927549"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "department_id"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }
}
