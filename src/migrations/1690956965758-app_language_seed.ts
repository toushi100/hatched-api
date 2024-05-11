import { AppLanguageEntity } from "src/shared/entities/app_languge.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class appLanguageSeed1690956965758 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO app_language (language_code, language)
            VALUES ('en', 'English'), ('ar', 'Arabic')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM app_language`);
    }

}
