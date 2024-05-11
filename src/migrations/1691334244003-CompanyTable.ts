import { MigrationInterface, QueryRunner } from "typeorm";

export class CompanyTable1691334244003 implements MigrationInterface {
    name = "CompanyTable1691334244003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "company" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "company_id" SERIAL NOT NULL, "name" character varying NOT NULL, "logo" character varying, "website" character varying, "accelerator_id" integer, "ios_url" character varying, "play_store_url" character varying, "fb_url" character varying, "ig_url" character varying, "linkedin_url" character varying, "twitter_url" character varying, "is_accelerator" boolean NOT NULL DEFAULT false, "is_investor" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b7f9888ba8bd654c4860ddfcb3a" PRIMARY KEY ("company_id"))`,
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "company_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_9e70b5f9d7095018e86970c7874" UNIQUE ("company_id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_9e70b5f9d7095018e86970c7874" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9e70b5f9d7095018e86970c7874"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_9e70b5f9d7095018e86970c7874"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "company_id"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }
}
