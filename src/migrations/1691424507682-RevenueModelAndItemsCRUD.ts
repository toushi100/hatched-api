import { MigrationInterface, QueryRunner } from "typeorm";

export class RevenueModelAndItemsCRUD1691424507682 implements MigrationInterface {
    name = "RevenueModelAndItemsCRUD1691424507682";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "revenue_model" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "revenue_model_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "business_model" character varying NOT NULL DEFAULT 'SaaS', CONSTRAINT "PK_79d066ad94de0ed85d113446613" PRIMARY KEY ("revenue_model_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "revenue_item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "revenue_item_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "initial_price" double precision NOT NULL, "revenue_model_id" integer, CONSTRAINT "PK_a450867f70558824aebb8ec4979" PRIMARY KEY ("revenue_item_id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "revenue_item" ADD CONSTRAINT "FK_8a8c8f7959222ae964f81ab5660" FOREIGN KEY ("revenue_model_id") REFERENCES "revenue_model"("revenue_model_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revenue_item" DROP CONSTRAINT "FK_8a8c8f7959222ae964f81ab5660"`);
        await queryRunner.query(`DROP TABLE "revenue_item"`);
        await queryRunner.query(`DROP TABLE "revenue_model"`);
    }
}
