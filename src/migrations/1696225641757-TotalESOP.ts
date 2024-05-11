import { MigrationInterface, QueryRunner } from "typeorm";

export class TotalESOP1696225641757 implements MigrationInterface {
    name = "TotalESOP1696225641757";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "total_esop" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "total_esop_id" SERIAL NOT NULL, "total_allocated_shares" double precision NOT NULL, "company_id" integer, CONSTRAINT "REL_f68366f85f2154a51968ff8f0b" UNIQUE ("company_id"), CONSTRAINT "PK_f27edc256ccdd229e99d30e3769" PRIMARY KEY ("total_esop_id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "total_esop" ADD CONSTRAINT "FK_f68366f85f2154a51968ff8f0b8" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "total_esop" DROP CONSTRAINT "FK_f68366f85f2154a51968ff8f0b8"`);
        await queryRunner.query(`DROP TABLE "total_esop"`);
    }
}
