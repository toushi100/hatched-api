import { MigrationInterface, QueryRunner } from "typeorm";

export class ESOPUpdates1695844550688 implements MigrationInterface {
    name = "ESOPUpdates1695844550688";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_3" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_4" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_5" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_6" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_6" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_5" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_4" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_3" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ALTER COLUMN "year_2" SET NOT NULL`);
    }
}
