import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvestors1699109600298 implements MigrationInterface {
    name = 'UpdateInvestors1699109600298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ADD "issued_shares" character varying`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "nationality" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "tax_no" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ALTER COLUMN "notes" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ALTER COLUMN "notes" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "tax_no" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "nationality" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" DROP COLUMN "issued_shares"`);
    }

}
