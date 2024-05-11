import { MigrationInterface, QueryRunner } from "typeorm";

export class BudgetItemAndCategory1692001544199 implements MigrationInterface {
    name = "BudgetItemAndCategory1692001544199";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."budget_category_type_enum" AS ENUM('REVENUE', 'DIRECT_COSTS', 'PERSONNEL_COSTS', 'OPERATING_EXPENSES')`,
        );
        await queryRunner.query(
            `CREATE TABLE "budget_category" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_category_id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."budget_category_type_enum" NOT NULL, "description" character varying NOT NULL, "display_order" integer, CONSTRAINT "PK_57caf59465a25d0f52d6dd6a609" PRIMARY KEY ("budget_category_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "budget_item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "budget_item_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "display_order" integer, "company_id" integer, "category_id" integer, CONSTRAINT "PK_e43380616a0d7ff6a344fca5750" PRIMARY KEY ("budget_item_id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "budget_item" ADD CONSTRAINT "FK_d636ae1c3822961f7c58746948a" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "budget_item" ADD CONSTRAINT "FK_c8adb87cf845dec6901f8da2468" FOREIGN KEY ("category_id") REFERENCES "budget_category"("budget_category_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "budget_item" DROP CONSTRAINT "FK_c8adb87cf845dec6901f8da2468"`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP CONSTRAINT "FK_d636ae1c3822961f7c58746948a"`);
        await queryRunner.query(`DROP TABLE "budget_item"`);
        await queryRunner.query(`DROP TABLE "budget_category"`);
        await queryRunner.query(`DROP TYPE "public"."budget_category_type_enum"`);
    }
}
