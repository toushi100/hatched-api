import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBudgetTables1698142401409 implements MigrationInterface {
    name = 'UpdateBudgetTables1698142401409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" DROP CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce"`);
        await queryRunner.query(`ALTER TABLE "budget_month" DROP CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942"`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" ADD CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce" FOREIGN KEY ("percentage_from_budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_month" ADD CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942" FOREIGN KEY ("budget_month_ratio_id") REFERENCES "budget_month_ratio"("budget_month_ratio_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "budget_month" DROP CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942"`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" DROP CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce"`);
        await queryRunner.query(`ALTER TABLE "budget_month" ADD CONSTRAINT "FK_e51bcd9ce8b0a8c3bfbcc7a6942" FOREIGN KEY ("budget_month_ratio_id") REFERENCES "budget_month_ratio"("budget_month_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_direct_cost" ADD CONSTRAINT "FK_dbaf0471a461a9d51bd092206ce" FOREIGN KEY ("percentage_from_budget_month_id") REFERENCES "budget_month"("budget_month_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
