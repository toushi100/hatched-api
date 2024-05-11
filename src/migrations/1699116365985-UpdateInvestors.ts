import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvestors1699116365985 implements MigrationInterface {
    name = 'UpdateInvestors1699116365985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round_investor_investment" DROP COLUMN "issued_shares"`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ADD "issued_shares_from" integer`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ADD "issued_shares_to" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round_investor_investment" DROP COLUMN "issued_shares_to"`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" DROP COLUMN "issued_shares_from"`);
        await queryRunner.query(`ALTER TABLE "round_investor_investment" ADD "issued_shares" character varying`);
    }

}
