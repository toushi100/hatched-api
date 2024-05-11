import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateDescription1698948579932 implements MigrationInterface {
    name = 'UpdateDescription1698948579932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revenue_model" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "revenue_model" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "revenue_item" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "revenue_item" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "budget_category" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "budget_category" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "description" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "budget_category" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "budget_category" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "revenue_item" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "revenue_item" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "revenue_model" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "revenue_model" ALTER COLUMN "description" SET NOT NULL`);
    }

}
