import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateFinancialItemDirectCostTable1693064630912 implements MigrationInterface {
    name = 'UpdateFinancialItemDirectCostTable1693064630912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df" FOREIGN KEY ("percentage_from_financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df" FOREIGN KEY ("percentage_from_financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
