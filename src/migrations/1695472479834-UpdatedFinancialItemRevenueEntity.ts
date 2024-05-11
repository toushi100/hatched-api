import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedFinancialItemRevenueEntity1695472479834 implements MigrationInterface {
    name = 'UpdatedFinancialItemRevenueEntity1695472479834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "quantity_exist_for_zero_quarter"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "quantity_exist_for_one_quarter"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "quantity_exist_for_two_or_more_quarters"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "existing_quantity_at_start_of_quarter" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "new_quarterly_quantities" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "quantity_leave_quarter_one" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "residual_churned_quantities" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "residual_churned_quantities"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "quantity_leave_quarter_one"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "new_quarterly_quantities"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP COLUMN "existing_quantity_at_start_of_quarter"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "quantity_exist_for_two_or_more_quarters" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "quantity_exist_for_one_quarter" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD "quantity_exist_for_zero_quarter" double precision NOT NULL DEFAULT '0'`);
    }

}
