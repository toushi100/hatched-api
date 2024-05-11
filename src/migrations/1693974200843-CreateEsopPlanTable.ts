import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateEsopPlanTable1693974200843 implements MigrationInterface {
    name = 'CreateEsopPlanTable1693974200843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "esop_plan" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "esop_plan_id" SERIAL NOT NULL, "name" character varying NOT NULL, "years" integer NOT NULL, "year_1" integer NULL, "year_2" integer NULL, "year_3" integer  NULL, "year_4" integer NULL, "year_5" integer NULL, "year_6" integer NULL, "company_id" integer, CONSTRAINT "PK_23e4d6c28539b9b0997a2503193" PRIMARY KEY ("esop_plan_id"))`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "esop_plan_id" integer`);
        await queryRunner.query(`ALTER TABLE "esop_plan" ADD CONSTRAINT "FK_9b47539942f471e284eacb9508a" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_0a7f5c92a24375610a14db64d39" FOREIGN KEY ("esop_plan_id") REFERENCES "esop_plan"("esop_plan_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_0a7f5c92a24375610a14db64d39"`);
        await queryRunner.query(`ALTER TABLE "esop_plan" DROP CONSTRAINT "FK_9b47539942f471e284eacb9508a"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "esop_plan_id"`);
        await queryRunner.query(`DROP TABLE "esop_plan"`);
    }

}
