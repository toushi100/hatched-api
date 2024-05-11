import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateCompanyInvestorsTable1699743552151 implements MigrationInterface {
    name = 'UpdateCompanyInvestorsTable1699743552151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_0bb1bba40378506bbf67613a804"`);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_0bb1bba40378506bbf67613a804" FOREIGN KEY ("investor_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_0bb1bba40378506bbf67613a804"`);
        await queryRunner.query(`ALTER TABLE "company_investors" ADD CONSTRAINT "FK_0bb1bba40378506bbf67613a804" FOREIGN KEY ("investor_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
