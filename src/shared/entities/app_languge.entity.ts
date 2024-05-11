import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AbstractEntity } from "../../common/abstract.entity";
import { StaticTextTranslationEntity } from "../../modules/static-text/entities/static-text-translation.entity";

@Entity("app_language")
export class AppLanguageEntity extends AbstractEntity {
    @PrimaryColumn({
        type: "varchar",
        name: "language_code"
    })
    languageCode: string;

    @Column({
        type: "varchar",
        name: "language"
    })
    language: string;

    @OneToMany(() => StaticTextTranslationEntity, (staticTextTranslation) => staticTextTranslation.appLanguage)
    staticTextTranslations: StaticTextTranslationEntity[];
}
