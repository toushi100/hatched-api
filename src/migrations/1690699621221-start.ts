import {MigrationInterface, QueryRunner} from "typeorm";

export class start1690699621221 implements MigrationInterface {
    name = 'start1690699621221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email-reset-password-code" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "verificationCode" character varying NOT NULL, CONSTRAINT "UQ_44c26c24d5457f670bbdad5cf47" UNIQUE ("email"), CONSTRAINT "PK_6aaa470bfe3c20d3715ce545f6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "email-verification-code" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "verificationCode" character varying NOT NULL, CONSTRAINT "UQ_a5d4c6afff4875fb31ee1e0d315" UNIQUE ("email"), CONSTRAINT "PK_8f90b3fe9ed3868e1320f8cb6fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_name_enum" AS ENUM('Admin')`);
        await queryRunner.query(`CREATE TABLE "role" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" SERIAL NOT NULL, "name" "public"."role_name_enum" NOT NULL DEFAULT 'Admin', CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_df46160e6aa79943b83c81e496e" PRIMARY KEY ("role_id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" SERIAL NOT NULL, "name" character varying, "email" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "password" character varying, "refreshToken" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "user-email-verification-code" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "verificationCode" character varying NOT NULL, "userId" integer, CONSTRAINT "REL_736a63f4f913d75d4c9f49f391" UNIQUE ("userId"), CONSTRAINT "PK_378e73ce7bf8b12be5f173f5598" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_language" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "language_code" character varying NOT NULL, "language" character varying NOT NULL, CONSTRAINT "PK_b56ffa66a1c58563b21d783c1a1" PRIMARY KEY ("language_code"))`);
        await queryRunner.query(`CREATE TYPE "public"."static_text_category_name_enum" AS ENUM('Mobile', 'Dashboard')`);
        await queryRunner.query(`CREATE TABLE "static_text" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "static_text_id" SERIAL NOT NULL, "text_key" character varying NOT NULL, "Key_description" character varying NOT NULL, "category_name" "public"."static_text_category_name_enum" NOT NULL DEFAULT 'Dashboard', CONSTRAINT "UQ_21b31919f489b2387da30bcb91a" UNIQUE ("text_key", "category_name"), CONSTRAINT "PK_6c57b462c401be5d0b698858e58" PRIMARY KEY ("static_text_id"))`);
        await queryRunner.query(`CREATE TABLE "static_text_translation" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "Id" SERIAL NOT NULL, "value" character varying, "static_text_id" integer, "language_code" character varying, CONSTRAINT "UQ_6ef541707b6f117a9beba7007bd" UNIQUE ("static_text_id", "language_code"), CONSTRAINT "PK_64eaa624de0f84149a087ed35fa" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles_role" ("userUserId" integer NOT NULL, "roleRoleId" integer NOT NULL, CONSTRAINT "PK_3dc5275c03a2ca0739f9cbd5754" PRIMARY KEY ("userUserId", "roleRoleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0bd606ba8531dd93b457b8486d" ON "user_roles_role" ("userUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_56f8ede2f2e059d4db74591c53" ON "user_roles_role" ("roleRoleId") `);
        await queryRunner.query(`ALTER TABLE "user-email-verification-code" ADD CONSTRAINT "FK_736a63f4f913d75d4c9f49f391c" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "static_text_translation" ADD CONSTRAINT "FK_4ac226b4ab244eb1e6fe73dae7c" FOREIGN KEY ("static_text_id") REFERENCES "static_text"("static_text_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "static_text_translation" ADD CONSTRAINT "FK_e0fd1a58f92fafc70cbc7ae98a5" FOREIGN KEY ("language_code") REFERENCES "app_language"("language_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_0bd606ba8531dd93b457b8486d9" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_56f8ede2f2e059d4db74591c533" FOREIGN KEY ("roleRoleId") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_56f8ede2f2e059d4db74591c533"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_0bd606ba8531dd93b457b8486d9"`);
        await queryRunner.query(`ALTER TABLE "static_text_translation" DROP CONSTRAINT "FK_e0fd1a58f92fafc70cbc7ae98a5"`);
        await queryRunner.query(`ALTER TABLE "static_text_translation" DROP CONSTRAINT "FK_4ac226b4ab244eb1e6fe73dae7c"`);
        await queryRunner.query(`ALTER TABLE "user-email-verification-code" DROP CONSTRAINT "FK_736a63f4f913d75d4c9f49f391c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56f8ede2f2e059d4db74591c53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0bd606ba8531dd93b457b8486d"`);
        await queryRunner.query(`DROP TABLE "user_roles_role"`);
        await queryRunner.query(`DROP TABLE "static_text_translation"`);
        await queryRunner.query(`DROP TABLE "static_text"`);
        await queryRunner.query(`DROP TYPE "public"."static_text_category_name_enum"`);
        await queryRunner.query(`DROP TABLE "app_language"`);
        await queryRunner.query(`DROP TABLE "user-email-verification-code"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
        await queryRunner.query(`DROP TABLE "email-verification-code"`);
        await queryRunner.query(`DROP TABLE "email-reset-password-code"`);
    }

}
