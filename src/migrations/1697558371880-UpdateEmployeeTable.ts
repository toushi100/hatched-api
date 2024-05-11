import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateEmployeeTable1697558371880 implements MigrationInterface {
    name = 'UpdateEmployeeTable1697558371880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_is_organization_head_enum" AS ENUM('yes', 'no')`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "is_organization_head" "public"."employee_is_organization_head_enum" NOT NULL DEFAULT 'no'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "is_organization_head"`);
        await queryRunner.query(`DROP TYPE "public"."employee_is_organization_head_enum"`);
    }

}
