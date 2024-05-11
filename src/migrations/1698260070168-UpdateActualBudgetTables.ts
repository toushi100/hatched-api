import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateActualBudgetTables1698260070168 implements MigrationInterface {
    name = 'UpdateActualBudgetTables1698260070168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "actual_budget_month" DROP CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" ADD CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8" FOREIGN KEY ("actual_budget_month_ratio_id") REFERENCES "actual_budget_month_ratio"("actual_budget_month_ratio_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "actual_budget_month" DROP CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8"`);
        await queryRunner.query(`ALTER TABLE "actual_budget_month" ADD CONSTRAINT "FK_a2d12d10eeb991312abc7aaabf8" FOREIGN KEY ("actual_budget_month_ratio_id") REFERENCES "actual_budget_month_ratio"("actual_budget_month_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
