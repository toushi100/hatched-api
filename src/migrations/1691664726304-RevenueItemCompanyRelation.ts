import { MigrationInterface, QueryRunner } from "typeorm";

export class RevenueItemCompanyRelation1691664726304 implements MigrationInterface {
    name = "RevenueItemCompanyRelation1691664726304";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revenue_item" ADD "company_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "revenue_item" ADD CONSTRAINT "FK_30c84892cf464b9ab6bca4718cb" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revenue_item" DROP CONSTRAINT "FK_30c84892cf464b9ab6bca4718cb"`);
        await queryRunner.query(`ALTER TABLE "revenue_item" DROP COLUMN "company_id"`);
    }
}
