import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatedItemTable1695492803726 implements MigrationInterface {
    name = 'CreatedItemTable1695492803726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "item_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "display_order" integer, "company_id" integer, CONSTRAINT "PK_8b21aa99996acd87a00c0ce553a" PRIMARY KEY ("item_id"))`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "budget_item" ADD "item_id" integer`);
        await queryRunner.query(`ALTER TABLE "budget_item" ADD CONSTRAINT "UQ_a226e3529492d4c9aef8421e928" UNIQUE ("item_id")`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD "item_id" integer`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "UQ_d4b6350f94a459b7403b18b26cc" UNIQUE ("item_id")`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_6aa7d1fc3afc8397157601ee740" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "budget_item" ADD CONSTRAINT "FK_a226e3529492d4c9aef8421e928" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD CONSTRAINT "FK_d4b6350f94a459b7403b18b26cc" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "FK_d4b6350f94a459b7403b18b26cc"`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP CONSTRAINT "FK_a226e3529492d4c9aef8421e928"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_6aa7d1fc3afc8397157601ee740"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP CONSTRAINT "UQ_d4b6350f94a459b7403b18b26cc"`);
        await queryRunner.query(`ALTER TABLE "financial_item" DROP COLUMN "item_id"`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP CONSTRAINT "UQ_a226e3529492d4c9aef8421e928"`);
        await queryRunner.query(`ALTER TABLE "budget_item" DROP COLUMN "item_id"`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "financial_item" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "budget_item" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "budget_item" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
