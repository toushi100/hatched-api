import {MigrationInterface, QueryRunner} from "typeorm";
import { StaticTextEntity } from "../modules/static-text/entities/static-text.entity";
import { StaticTextCategoryEnum } from "../modules/static-text/static-text-category.enum";
import { StaticTextTranslationEntity } from "../modules/static-text/entities/static-text-translation.entity";
import * as assert from "assert";

export abstract class AbstractStaticTextMigration implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const staticTextValues = this.getStaticTextValues();
        const result = await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(StaticTextEntity)
            .values(staticTextValues)
            .returning(["id", "textKey"])
            .orUpdate( ["text_key"], ["category_name", "text_key"] )
            .execute();

        const keyIdMap = {};
        for (let i = 0; i < result.identifiers.length; i++) {
            keyIdMap[ staticTextValues[ i ].textKey ] = result.identifiers[ i ].id;
        }

        const arabic = this.getArabicStaticTranslationTexts();
        const english = this.getEnglishStaticTranslationTexts();

        await this.insertStaticTranslationTexts(queryRunner, arabic, keyIdMap, "ar");
        await this.insertStaticTranslationTexts(queryRunner, english, keyIdMap, "en");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = this.getStaticTextCategory();
        await queryRunner.manager
            .createQueryBuilder()
            .from(StaticTextEntity, "staticText")
            .delete()
            .where("text_key IN (:...ids) AND categoryName = :categoryName", {
                ids: this.getStaticTextKeys(),
                categoryName
            })
            .execute();
    }

    private async insertStaticTranslationTexts(queryRunner: QueryRunner, values, keyIdMap, languageCode) {
        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(StaticTextTranslationEntity)
            .values(values.reduce(
                (r, e, index) =>
                    r.push(
                        {
                            value: e.value,
                            appLanguage: {
                                languageCode
                            },
                            staticText: {
                                id: keyIdMap[ e.key ]
                            }
                        }
                    ) && r, [])
            )
            .returning(["id", "value", "staticText", "appLanguage"])
            .orUpdate( ["value"], ["static_text_id", "language_code"] )
            .execute();
    }

    private getStaticTextKeys() {
        const english = this.getEnglishStaticTranslationTexts();
        const keys = [];
        for (let i = 0; i < english.length; i++) {
            keys.push(english[ i ].key);
        }
        return keys;
    }

    private getStaticTextValues() {
        const categoryName = this.getStaticTextCategory();
        const arabic = this.getArabicStaticTranslationTexts();
        const english = this.getEnglishStaticTranslationTexts();
        const staticTextsValues = [];

        const keys = [];
        assert(arabic.length === english.length);
        for (let i = 0; i < english.length; i++) {
            let found = false;
            for (let j = 0; j < arabic.length; j++) {
                if (english[ i ].key === arabic[ j ].key) {
                    found = true;
                    break;
                }
            }
            assert(found);
            assert(!keys.includes(english[ i ].key));
            keys.push(english[ i ].key);

            staticTextsValues.push({
                textKey: english[ i ].key,
                keyDescription: english[ i ].description,
                categoryName
            });
        }

        return staticTextsValues;
    }

    public abstract getStaticTextCategory(): StaticTextCategoryEnum;

    public abstract getArabicStaticTranslationTexts(): StaticTextKeyValue[];

    public abstract getEnglishStaticTranslationTexts(): StaticTextKeyValue[];
}

export interface StaticTextKeyValue {
    key: string;
    value: string;
    description: string;
}
