import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateFinancialTables1699740294501 implements MigrationInterface {
    name = 'UpdateFinancialTables1699740294501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df" FOREIGN KEY ("percentage_from_financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4" FOREIGN KEY ("financial_quarter_ratio_id") REFERENCES "financial_quarter_ratio"("financial_quarter_ratio_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD CONSTRAINT "FK_87632baca9fe4a3c255d2946fb4" FOREIGN KEY ("financial_quarter_ratio_id") REFERENCES "financial_quarter_ratio"("financial_quarter_ratio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df" FOREIGN KEY ("percentage_from_financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
