import { MigrationInterface, QueryRunner } from "typeorm";

export class InvestorRelations1693912300890 implements MigrationInterface {
    name = "InvestorRelations1693912300890";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "pending_invitation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "invitation_id" SERIAL NOT NULL, "invitee_email" character varying NOT NULL, "inviter_company_id" integer, CONSTRAINT "PK_8bfe126ad07b9918b5c3b97ec64" PRIMARY KEY ("invitation_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "accelerator" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "accelerator_id" SERIAL NOT NULL, "name" character varying NOT NULL, "title" character varying, CONSTRAINT "PK_e76c79f578e92a8df4a1e68de6f" PRIMARY KEY ("accelerator_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "company_investors" ("company_id" integer NOT NULL, "investor_id" integer NOT NULL, CONSTRAINT "PK_99f5cb00e1184b9d7ffd9f3494f" PRIMARY KEY ("company_id", "investor_id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_9400ab5ad0313eac8a7b419bb7" ON "company_investors" ("company_id") `);
        await queryRunner.query(
            `CREATE INDEX "IDX_8f69f82eeb1f9e5f6493a1849b" ON "company_investors" ("investor_id") `,
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "accelerator_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_a5180cfebca6b2e7116cb27ba79" UNIQUE ("accelerator_id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "pending_invitation" ADD CONSTRAINT "FK_ca6c1077310671e7917d164bc67" FOREIGN KEY ("inviter_company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "company" ADD CONSTRAINT "FK_34da2bc2fe731627890e952d7ac" FOREIGN KEY ("accelerator_id") REFERENCES "accelerator"("accelerator_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_a5180cfebca6b2e7116cb27ba79" FOREIGN KEY ("accelerator_id") REFERENCES "accelerator"("accelerator_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "company_investors" ADD CONSTRAINT "FK_9400ab5ad0313eac8a7b419bb79" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "company_investors" ADD CONSTRAINT "FK_8f69f82eeb1f9e5f6493a1849b7" FOREIGN KEY ("investor_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_8f69f82eeb1f9e5f6493a1849b7"`);
        await queryRunner.query(`ALTER TABLE "company_investors" DROP CONSTRAINT "FK_9400ab5ad0313eac8a7b419bb79"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_a5180cfebca6b2e7116cb27ba79"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_34da2bc2fe731627890e952d7ac"`);
        await queryRunner.query(`ALTER TABLE "pending_invitation" DROP CONSTRAINT "FK_ca6c1077310671e7917d164bc67"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_a5180cfebca6b2e7116cb27ba79"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "accelerator_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f69f82eeb1f9e5f6493a1849b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9400ab5ad0313eac8a7b419bb7"`);
        await queryRunner.query(`DROP TABLE "company_investors"`);
        await queryRunner.query(`DROP TABLE "accelerator"`);
        await queryRunner.query(`DROP TABLE "pending_invitation"`);
    }
}
