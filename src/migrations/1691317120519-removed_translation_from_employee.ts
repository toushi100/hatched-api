import { MigrationInterface, QueryRunner } from "typeorm";

export class removedTranslationFromEmployee1691317120519 implements MigrationInterface {
    name = 'removedTranslationFromEmployee1691317120519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_translation" DROP CONSTRAINT "FK_1f0452d66901b77d68cbdf21cd4"`);
        await queryRunner.query(`ALTER TABLE "employee_translation" DROP CONSTRAINT "FK_57c91f57e24a3e5c4459ba34a61"`);
        await queryRunner.query(`DROP TABLE "employee_translation"`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "title" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "title"`);
        await queryRunner.query(`CREATE TABLE "employee_translation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employee_translation_id" SERIAL NOT NULL, "title" character varying NOT NULL, "employee_id" integer, "language_code" character varying, CONSTRAINT "PK_eca06b8de361ad89612f320df0b" PRIMARY KEY ("employee_translation_id"))`);
        await queryRunner.query(`ALTER TABLE "employee_translation" ADD CONSTRAINT "FK_57c91f57e24a3e5c4459ba34a61" FOREIGN KEY ("employee_id") REFERENCES "employee"("employee_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_translation" ADD CONSTRAINT "FK_1f0452d66901b77d68cbdf21cd4" FOREIGN KEY ("language_code") REFERENCES "app_language"("language_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
