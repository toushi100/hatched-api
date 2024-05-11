import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedBudgetItemRevenueEntity1695027971241 implements MigrationInterface {
    name = 'UpdatedBudgetItemRevenueEntity1695027971241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_ecf8cde4dcfffa89996f43c2d3fc63a0"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_ecf8cde4dcfffa89996fc2d3fc63a0"`);
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_9400ab5ad0313eac8a7b419bb79"`);
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_8f69f82eeb1f9e5f6493a1849b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9400ab5ad0313eac8a7b419bb7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f69f82eeb1f9e5f6493a1849b"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_exist_for_zero_month"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_exist_for_one_month"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_exist_for_two_month"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_exist_for_three_month"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_exist_for_four_or_more_months"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "existing_quantity_at_start_of_month" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "new_monthly_quantities" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_leave_month_one" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_leave_month_two" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_leave_month_three" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "residual_churned_quantities" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "financial_item_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "UQ_1f766ea6015fb624a4656d1a415" UNIQUE ("financial_item_id")`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "budget_item_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "UQ_2073f1cb6a112d7c47f7265ddff" UNIQUE ("budget_item_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_775db15c7e0af467ecd6fab114" ON "company_investors" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0bb1bba40378506bbf67613a80" ON "company_investors" ("investor_id") `);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_1f766ea6015fb624a4656d1a415" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff" FOREIGN KEY ("budget_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_775db15c7e0af467ecd6fab1144" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_0bb1bba40378506bbf67613a804" FOREIGN KEY ("investor_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_0bb1bba40378506bbf67613a804"`);
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_775db15c7e0af467ecd6fab1144"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_1f766ea6015fb624a4656d1a415"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0bb1bba40378506bbf67613a80"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775db15c7e0af467ecd6fab114"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "UQ_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "budget_item_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "UQ_1f766ea6015fb624a4656d1a415"`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "financial_item_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "residual_churned_quantities"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_leave_month_three"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_leave_month_two"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "quantity_leave_month_one"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "new_monthly_quantities"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP COLUMN "existing_quantity_at_start_of_month"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_exist_for_four_or_more_months" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_exist_for_three_month" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_exist_for_two_month" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_exist_for_one_month" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD "quantity_exist_for_zero_month" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX "IDX_8f69f82eeb1f9e5f6493a1849b" ON "company_investors" ("investor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9400ab5ad0313eac8a7b419bb7" ON "company_investors" ("company_id") `);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_8f69f82eeb1f9e5f6493a1849b7" FOREIGN KEY ("investor_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_9400ab5ad0313eac8a7b419bb79" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_ecf8cde4dcfffa89996fc2d3fc63a0" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_ecf8cde4dcfffa89996f43c2d3fc63a0" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
