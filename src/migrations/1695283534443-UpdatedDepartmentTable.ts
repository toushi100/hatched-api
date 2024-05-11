import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedDepartmentTable1695283534443 implements MigrationInterface {
    name = 'UpdatedDepartmentTable1695283534443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item"("budget_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff"`);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_2073f1cb6a112d7c47f7265ddff" FOREIGN KEY ("budget_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
