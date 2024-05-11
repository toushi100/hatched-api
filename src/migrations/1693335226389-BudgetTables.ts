import {MigrationInterface, QueryRunner} from "typeorm";

export class BudgetTables1693335226389 implements MigrationInterface {
    name = 'BudgetTables1693335226389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "budget_item_revenue_future_growth" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_item_revenue_future_growth_id" SERIAL NOT NULL, "monthly_growth" double precision NOT NULL DEFAULT '0', "month1_churn" double precision NOT NULL DEFAULT '0', "month2_churn" double precision NOT NULL DEFAULT '0', "month3_churn" double precision NOT NULL DEFAULT '0', "months4_to_12_churn_rate" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_bb38e8c4ef99990c4962b695563" PRIMARY KEY ("budget_item_revenue_future_growth_id"))`);
        await queryRunner.query(`CREATE TABLE "budget_item_direct_cost" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_item_direct_cost_id" SERIAL NOT NULL, "percentage" double precision NOT NULL DEFAULT '0', "amount" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "budget_month_id" integer, "budget_item_id" integer, "percentage_from_budget_month_id" integer, CONSTRAINT "PK_e8c221290828220a6e4780b2940" PRIMARY KEY ("budget_item_direct_cost_id"))`);
        await queryRunner.query(`CREATE TABLE "budget_item_manual_cost" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_item_manual_cost_id" SERIAL NOT NULL, "monthly_growth" double precision NOT NULL DEFAULT '0', "amount" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "parent_budget_item_manual_cost_id" integer, "budget_month_id" integer, "budget_item_id" integer, CONSTRAINT "PK_4cdb77d1331259ab74140b9cc6a" PRIMARY KEY ("budget_item_manual_cost_id"))`);
        await queryRunner.query(`CREATE TABLE "budget_month_ratio" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_month_ratio_id" SERIAL NOT NULL, "month_date" TIMESTAMP NOT NULL, "month_number" integer NOT NULL, "gross_income" double precision NOT NULL DEFAULT '0', "total_direct_costs" double precision NOT NULL DEFAULT '0', "gross_margin" double precision NOT NULL DEFAULT '0', "gross_margin_percentage" double precision NOT NULL DEFAULT '0', "total_personnel_costs" double precision NOT NULL DEFAULT '0', "total_operating_expenses" double precision NOT NULL DEFAULT '0', "ebitda" double precision NOT NULL DEFAULT '0', "ebitda_percentage" double precision NOT NULL DEFAULT '0', "company_id" integer, CONSTRAINT "PK_2e253f8f4b93cc47a6755a36fe0" PRIMARY KEY ("budget_month_ratio_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."budget_month_category_type_enum" AS ENUM('REVENUE', 'DIRECT_COSTS', 'PERSONNEL_COSTS', 'OPERATING_EXPENSES')`);
        await queryRunner.query(`CREATE TABLE "budget_month" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_month_id" SERIAL NOT NULL, "month_date" TIMESTAMP NOT NULL, "month_number" integer NOT NULL, "value" double precision NOT NULL DEFAULT '0', "display_order" integer, "category_type" "public"."budget_month_category_type_enum" NOT NULL, "old_value" double precision NOT NULL DEFAULT '0', "budget_item_id" integer, "budget_month_ratio_id" integer, CONSTRAINT "PK_4a8b78ecbbbda0015b9d6a54bd2" PRIMARY KEY ("budget_month_id"))`);
        await queryRunner.query(`CREATE TABLE "budget_item_revenue" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_item_revenue_id" SERIAL NOT NULL, "quantity" double precision NOT NULL DEFAULT '0', "price" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "quantity_exist_for_zero_month" double precision NOT NULL DEFAULT '0', "quantity_exist_for_one_month" double precision NOT NULL DEFAULT '0', "quantity_exist_for_two_month" double precision NOT NULL DEFAULT '0', "quantity_exist_for_three_month" double precision NOT NULL DEFAULT '0', "quantity_exist_for_four_or_more_months" double precision NOT NULL DEFAULT '0', "parent_budget_item_revenue_id" integer, "budget_item_revenue_future_growth_id" integer, "revenue_item_id" integer, "budget_item_id" integer, "budget_month_id" integer, CONSTRAINT "PK_d78985fa701f1f5f199db94d23c" PRIMARY KEY ("budget_item_revenue_id"))`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" ADD CONSTRAINT "FK_2dff215b638a57adddcea1140d7" FOREIGN KEY ("budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" ADD CONSTRAINT "FK_2754a230336778e8bbe1e1dff1b" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" ADD CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce" FOREIGN KEY ("percentage_from_budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" ADD CONSTRAINT "FK_e961ce9de6ef85cf4d50c141b89" FOREIGN KEY ("parent_budget_item_manual_cost_id") REFERENCES "budget_item_manual_cost"("budget_item_manual_cost_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" ADD CONSTRAINT "FK_4a519b0e04bd2d85450ae495923" FOREIGN KEY ("budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" ADD CONSTRAINT "FK_cad85f04f490fd9050ee02fb457" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_month_ratio" ADD CONSTRAINT "FK_0681a335af7ac94f5860faa65dc" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_month" ADD CONSTRAINT "FK_3255094c82e7714870ef17f8f21" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_month" ADD CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942" FOREIGN KEY ("budget_month_ratio_id") REFERENCES "budget_month_ratio"("budget_month_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_caba6ae7f787c4a02395eab3f20" FOREIGN KEY ("parent_budget_item_revenue_id") REFERENCES "budget_item_revenue"("budget_item_revenue_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_5cc859dd5b23c758c0bca0c13d9" FOREIGN KEY ("budget_item_revenue_future_growth_id") REFERENCES "budget_item_revenue_future_growth"("budget_item_revenue_future_growth_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_7323c1a78846aec4e0210490870" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_5293cca17940095abae6fdfec1f" FOREIGN KEY ("budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_5293cca17940095abae6fdfec1f"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_7323c1a78846aec4e0210490870"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_5cc859dd5b23c758c0bca0c13d9"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_caba6ae7f787c4a02395eab3f20"`);
        await queryRunner.query(`ALTER TABLE "budget_month" DROP CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942"`);
        await queryRunner.query(`ALTER TABLE "budget_month" DROP CONSTRAINT "FK_3255094c82e7714870ef17f8f21"`);
        await queryRunner.query(`ALTER TABLE "budget_month_ratio" DROP CONSTRAINT "FK_0681a335af7ac94f5860faa65dc"`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" DROP CONSTRAINT "FK_cad85f04f490fd9050ee02fb457"`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" DROP CONSTRAINT "FK_4a519b0e04bd2d85450ae495923"`);
        await queryRunner.query(`ALTER TABLE "budget_item_manual_cost" DROP CONSTRAINT "FK_e961ce9de6ef85cf4d50c141b89"`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" DROP CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce"`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" DROP CONSTRAINT "FK_2754a230336778e8bbe1e1dff1b"`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" DROP CONSTRAINT "FK_2dff215b638a57adddcea1140d7"`);
        await queryRunner.query(`DROP TABLE "budget_item_revenue"`);
        await queryRunner.query(`DROP TABLE "budget_month"`);
        await queryRunner.query(`DROP TYPE "public"."budget_month_category_type_enum"`);
        await queryRunner.query(`DROP TABLE "budget_month_ratio"`);
        await queryRunner.query(`DROP TABLE "budget_item_manual_cost"`);
        await queryRunner.query(`DROP TABLE "budget_item_direct_cost"`);
        await queryRunner.query(`DROP TABLE "budget_item_revenue_future_growth"`);
    }

}
