import { MigrationInterface, QueryRunner } from "typeorm";

export class FinancialItem1692088932967 implements MigrationInterface {
    name = "FinancialItem1692088932967";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "financial_item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_item_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "display_order" integer, "company_id" integer, "category_id" integer, CONSTRAINT "PK_ea2af2521e723527e7813f3b361" PRIMARY KEY ("financial_item_id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "financial_item" ADD CONSTRAINT "FK_2221ee62b2c2216a60fc66507b1" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "financial_item" ADD CONSTRAINT "FK_1740cb4a377bb90a7c4d09b2088" FOREIGN KEY ("category_id") REFERENCES "budget_category"("budget_category_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_1740cb4a377bb90a7c4d09b2088"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_2221ee62b2c2216a60fc66507b1"`);
        await queryRunner.query(`DROP TABLE "financial_item"`);
    }
}
