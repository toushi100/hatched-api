import {MigrationInterface, QueryRunner} from "typeorm";

export class CompanyPlanDateTable1692240734593 implements MigrationInterface {
    name = 'CompanyPlanDateTable1692240734593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_2221ee62b2c2216a60fc66507b1"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_1740cb4a377bb90a7c4d09b2088"`);
        await queryRunner.query(`CREATE TABLE "company_plan_date" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "company_plan_date_id" SERIAL NOT NULL, "budget_start_date" TIMESTAMP NOT NULL, "budget_end_date" TIMESTAMP NOT NULL, "financial_start_date" TIMESTAMP NOT NULL, "financial_end_date" TIMESTAMP NOT NULL, "company_id" integer, CONSTRAINT "REL_5e0bf08ea8ecca29c236d05b1a" UNIQUE ("company_id"), CONSTRAINT "PK_f1c857ba183cb3794b5b62ad7f2" PRIMARY KEY ("company_plan_date_id"))`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "FK_2dec5f66a2a6c5317c22e8cf003" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "FK_0c5ea5d55fe8d854e1561727928" FOREIGN KEY ("category_id") REFERENCES "budget_category"("budget_category_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_plan_date" ADD CONSTRAINT "FK_5e0bf08ea8ecca29c236d05b1a0" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_plan_date" DROP CONSTRAINT "FK_5e0bf08ea8ecca29c236d05b1a0"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_0c5ea5d55fe8d854e1561727928"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_2dec5f66a2a6c5317c22e8cf003"`);
        await queryRunner.query(`DROP TABLE "company_plan_date"`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "FK_1740cb4a377bb90a7c4d09b2088" FOREIGN KEY ("category_id") REFERENCES "budget_category"("budget_category_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "FK_2221ee62b2c2216a60fc66507b1" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
