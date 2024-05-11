import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBudgetItemIdToDepartments1694518525126 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" ADD column "budget_item_id" integer`);

        await queryRunner.query(`ALTER TABLE "department"
                ADD CONSTRAINT "FK_ecf8cde4dcfffa89996f43c2d3fc63a0" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item" ("budget_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP COLUMN "budget_item_id"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_ecf8cde4dcfffa89996f43c2d3fc63a0"`);
    }
}
