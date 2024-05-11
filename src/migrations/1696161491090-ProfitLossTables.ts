import {MigrationInterface, QueryRunner} from "typeorm";

export class ProfitLossTables1696161491090 implements MigrationInterface {
    name = 'ProfitLossTables1696161491090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "actual_budget_month_ratio" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "actual_budget_month_ratio_id" SERIAL NOT NULL, "month_date" TIMESTAMP NOT NULL, "month_number" integer NOT NULL, "gross_income" double precision NOT NULL DEFAULT '0', "total_direct_costs" double precision NOT NULL DEFAULT '0', "gross_margin" double precision NOT NULL DEFAULT '0', "gross_margin_percentage" double precision NOT NULL DEFAULT '0', "total_personnel_costs" double precision NOT NULL DEFAULT '0', "total_operating_expenses" double precision NOT NULL DEFAULT '0', "ebitda" double precision NOT NULL DEFAULT '0', "ebitda_percentage" double precision NOT NULL DEFAULT '0', "company_id" integer, CONSTRAINT "PK_58d06d1968bb06a228c66eb8765" PRIMARY KEY ("actual_budget_month_ratio_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."actual_budget_month_category_type_enum" AS ENUM('REVENUE', 'DIRECT_COSTS', 'PERSONNEL_COSTS', 'OPERATING_EXPENSES')`);
        await queryRunner.query(`CREATE TABLE "actual_budget_month" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "actual_budget_month_id" SERIAL NOT NULL, "month_date" TIMESTAMP NOT NULL, "month_number" integer NOT NULL, "value" double precision NOT NULL DEFAULT '0', "display_order" integer, "category_type" "public"."actual_budget_month_category_type_enum" NOT NULL, "old_value" double precision NOT NULL DEFAULT '0', "actual_budget_item_id" integer, "actual_budget_month_ratio_id" integer, CONSTRAINT "PK_b53794558d5323d116519353572" PRIMARY KEY ("actual_budget_month_id"))`);
        await queryRunner.query(`CREATE TABLE "actual_budget_item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "actual_budget_item_id" SERIAL NOT NULL, "display_order" integer, "company_id" integer, "category_id" integer, "item_id" integer, CONSTRAINT "REL_8ebfb2e912205324c8075b3c14" UNIQUE ("item_id"), CONSTRAINT "PK_16daab466c10efb79e42f8c8d92" PRIMARY KEY ("actual_budget_item_id"))`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month_ratio" ADD CONSTRAINT "FK_4b3561421265ed266215254bfbf" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" ADD CONSTRAINT "FK_ce3b280cffb49b7a1e5f31cabe3" FOREIGN KEY ("actual_budget_item_id") REFERENCES "actual_budget_item"("actual_budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" ADD CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8" FOREIGN KEY ("actual_budget_month_ratio_id") REFERENCES "actual_budget_month_ratio"("actual_budget_month_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actual_budget_item" ADD CONSTRAINT "FK_c3fe8184f5a251145e900b1ec02" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actual_budget_item" ADD CONSTRAINT "FK_d6a60eac2aea5740e69997ca393" FOREIGN KEY ("category_id") REFERENCES "budget_category"("budget_category_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actual_budget_item" ADD CONSTRAINT "FK_8ebfb2e912205324c8075b3c14c" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "actual_budget_item" DROP CONSTRAINT "FK_8ebfb2e912205324c8075b3c14c"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_item" DROP CONSTRAINT "FK_d6a60eac2aea5740e69997ca393"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_item" DROP CONSTRAINT "FK_c3fe8184f5a251145e900b1ec02"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" DROP CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" DROP CONSTRAINT "FK_ce3b280cffb49b7a1e5f31cabe3"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month_ratio" DROP CONSTRAINT "FK_4b3561421265ed266215254bfbf"`);
        await queryRunner.query(`DROP TABLE "actual_budget_item"`);
        await queryRunner.query(`DROP TABLE "actual_budget_month"`);
        await queryRunner.query(`DROP TYPE "public"."actual_budget_month_category_type_enum"`);
        await queryRunner.query(`DROP TABLE "actual_budget_month_ratio"`);
    }

}
