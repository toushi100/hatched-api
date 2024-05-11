import { MigrationInterface, QueryRunner } from "typeorm";

export class EmployeeVestedYears1696323299264 implements MigrationInterface {
    name = "EmployeeVestedYears1696323299264";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "employee_vested_years" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vested_years_id" SERIAL NOT NULL, "vested_years" integer NOT NULL DEFAULT '0', "employee_id" integer, CONSTRAINT "REL_a845ea26dd88156e3bae7201da" UNIQUE ("employee_id"), CONSTRAINT "PK_c24dab9ea052a5021f3be1c5333" PRIMARY KEY ("vested_years_id"))`,
        );
        await queryRunner.query(`ALTER TABLE "esop_plan" DROP COLUMN "year_6"`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "shares_vested" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(
            `ALTER TABLE "employee_vested_years" ADD CONSTRAINT "FK_a845ea26dd88156e3bae7201da2" FOREIGN KEY ("employee_id") REFERENCES "employee"("employee_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_vested_years" DROP CONSTRAINT "FK_a845ea26dd88156e3bae7201da2"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "shares_vested"`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ADD "year_6" integer`);
        await queryRunner.query(`DROP TABLE "employee_vested_years"`);
    }
}
