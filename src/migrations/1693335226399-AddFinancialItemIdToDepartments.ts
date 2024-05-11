import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinancialItemIdToDepartments1693335226399 implements MigrationInterface {
    name = "AddFinancialItemIdToDepartments1693335226399";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" ADD column "financial_item_id" integer`);

        await queryRunner.query(`ALTER TABLE "department"
                ADD CONSTRAINT "FK_ecf8cde4dcfffa89996fc2d3fc63a0" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item" ("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP COLUMN "financial_item_id"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_ecf8cde4dcfffa89996fc2d3fc63a0"`);
    }
}
