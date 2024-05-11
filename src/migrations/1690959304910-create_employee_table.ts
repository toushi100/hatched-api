import {MigrationInterface, QueryRunner} from "typeorm";

export class createEmployeeTable1690959304910 implements MigrationInterface {
    name = 'createEmployeeTable1690959304910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employee_id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "birth_date" TIMESTAMP NOT NULL, "phone" character varying NOT NULL, "tax_no" character varying NOT NULL, "social_security" character varying NOT NULL, "email" character varying NOT NULL, "yearly_salary" double precision NOT NULL, "monthly_cost" double precision NOT NULL, "children_below_18" integer NOT NULL DEFAULT '0', "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP, "is_founder" character varying NOT NULL, "shares_allocated" double precision NOT NULL, "reportingToId" integer, CONSTRAINT "UQ_817d1d427138772d47eca048855" UNIQUE ("email"), CONSTRAINT "PK_f9d306b968b54923539b3936b03" PRIMARY KEY ("employee_id"))`);
        await queryRunner.query(`CREATE TABLE "employee_translation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employee_translation_id" SERIAL NOT NULL, "title" character varying NOT NULL, "employee_id" integer, "language_code" character varying, CONSTRAINT "PK_eca06b8de361ad89612f320df0b" PRIMARY KEY ("employee_translation_id"))`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_5c0e9b9e93dc14cdfefdc554ec7" FOREIGN KEY ("reportingToId") REFERENCES "employee"("employee_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_translation" ADD CONSTRAINT "FK_57c91f57e24a3e5c4459ba34a61" FOREIGN KEY ("employee_id") REFERENCES "employee"("employee_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_translation" ADD CONSTRAINT "FK_1f0452d66901b77d68cbdf21cd4" FOREIGN KEY ("language_code") REFERENCES "app_language"("language_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_translation" DROP CONSTRAINT "FK_1f0452d66901b77d68cbdf21cd4"`);
        await queryRunner.query(`ALTER TABLE "employee_translation" DROP CONSTRAINT "FK_57c91f57e24a3e5c4459ba34a61"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_5c0e9b9e93dc14cdfefdc554ec7"`);
        await queryRunner.query(`DROP TABLE "employee_translation"`);
        await queryRunner.query(`DROP TABLE "employee"`);
    }

}
