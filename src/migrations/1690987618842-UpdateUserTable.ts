import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1690987618842 implements MigrationInterface {
    name = "UpdateUserTable1690987618842";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email-verification-code" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(
            `CREATE TYPE "public"."email-verification-code_accounttype_enum" AS ENUM('Investor', 'Startup', 'Accelerator')`,
        );
        await queryRunner.query(
            `ALTER TABLE "email-verification-code" ADD "accountType" "public"."email-verification-code_accounttype_enum" NOT NULL`,
        );
        await queryRunner.query(`ALTER TABLE "email-verification-code" ADD "companyName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`,
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "nationality" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "tax_no" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "job_title" character varying`);
        await queryRunner.query(
            `CREATE TYPE "public"."user_account_type_enum" AS ENUM('Investor', 'Startup', 'Accelerator')`,
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "account_type" "public"."user_account_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "access_token" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "account_type"`);
        await queryRunner.query(`DROP TYPE "public"."user_account_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "job_title"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tax_no"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nationality"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" DROP COLUMN "companyName"`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" DROP COLUMN "accountType"`);
        await queryRunner.query(`DROP TYPE "public"."email-verification-code_accounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "email-verification-code" ADD "name" character varying NOT NULL`);
    }
}
