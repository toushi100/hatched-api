import { MigrationInterface, QueryRunner } from "typeorm";

export class CompanyDepartmentRelation1691597837460 implements MigrationInterface {
    name = "CompanyDepartmentRelation1691597837460";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" ADD "company_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "department" ADD CONSTRAINT "FK_f840e8ae1c80c7acb64dc668118" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_f840e8ae1c80c7acb64dc668118"`);
        await queryRunner.query(`ALTER TABLE "department" DROP COLUMN "company_id"`);
    }
}
