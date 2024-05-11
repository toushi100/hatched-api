import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedDepartmentTable1695282951943 implements MigrationInterface {
    name = 'UpdatedDepartmentTable1695282951943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_1f766ea6015fb624a4656d1a415"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "financial_item_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "budget_item_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_1f766ea6015fb624a4656d1a415" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff" FOREIGN KEY ("budget_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_1f766ea6015fb624a4656d1a415"`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "budget_item_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "financial_item_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff" FOREIGN KEY ("budget_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_1f766ea6015fb624a4656d1a415" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
