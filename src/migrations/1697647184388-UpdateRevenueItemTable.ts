import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateRevenueItemTable1697647184388 implements MigrationInterface {
    name = 'UpdateRevenueItemTable1697647184388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" DROP CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067"`);
        await queryRunner.query(`ALTER TABLE "budget_item_revenue" ADD CONSTRAINT "FK_8ca3c42df413ec3a8736e1c734a" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
