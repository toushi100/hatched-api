import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateFinancialRatiosTable1693142775705 implements MigrationInterface {
    name = 'CreateFinancialRatiosTable1693142775705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "financial_quarter_ratio" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_quarter_ratio_id" SERIAL NOT NULL, "quarter_date" TIMESTAMP NOT NULL, "quarter_number" integer NOT NULL, "gross_income" double precision NOT NULL DEFAULT '0', "total_direct_costs" double precision NOT NULL DEFAULT '0', "gross_margin" double precision NOT NULL DEFAULT '0', "gross_margin_percentage" double precision NOT NULL DEFAULT '0', "total_personnel_costs" double precision NOT NULL DEFAULT '0', "total_operating_expenses" double precision NOT NULL DEFAULT '0', "ebitda" double precision NOT NULL DEFAULT '0', "ebitda_percentage" double precision NOT NULL DEFAULT '0', "company_id" integer, CONSTRAINT "PK_2e9ae16e035454940bd3396597f" PRIMARY KEY ("financial_quarter_ratio_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."financial_quarter_category_type_enum" AS ENUM('REVENUE', 'DIRECT_COSTS', 'PERSONNEL_COSTS', 'OPERATING_EXPENSES')`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD "category_type" "public"."financial_quarter_category_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD "old_value" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD "financial_quarter_ratio_id" integer`);
        await queryRunner.query(`ALTER TABLE "financial_quarter_ratio" ADD CONSTRAINT "FK_e022f17b9e61c37fc979fd49389" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4" FOREIGN KEY ("financial_quarter_ratio_id") REFERENCES "financial_quarter_ratio"("financial_quarter_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter_ratio" DROP CONSTRAINT "FK_e022f17b9e61c37fc979fd49389"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP COLUMN "financial_quarter_ratio_id"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP COLUMN "old_value"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP COLUMN "category_type"`);
        await queryRunner.query(`DROP TYPE "public"."financial_quarter_category_type_enum"`);
        await queryRunner.query(`DROP TABLE "financial_quarter_ratio"`);
    }

}
