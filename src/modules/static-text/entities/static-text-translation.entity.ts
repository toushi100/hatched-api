import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AppLanguageEntity } from "../../../shared/entities/app_languge.entity";
import { AbstractEntity } from "../../../common/abstract.entity";
import { StaticTextEntity } from "./static-text.entity";

@Entity("static_text_translation")
@Unique(["staticText", "appLanguage"])
export class StaticTextTranslationEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "Id",
    })
    @Expose()
    id: number;

    @Column({
        name: "value",
        type: "varchar",
        nullable: true,
    })
    @Expose()
    value: string;

    @ManyToOne((_type) => StaticTextEntity, (staticText) => staticText.staticTextTranslations, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "static_text_id",
    })
    staticText: StaticTextEntity;

    @ManyToOne((_type) => AppLanguageEntity, (appLanguage) => appLanguage.staticTextTranslations)
    @JoinColumn({
        name: "language_code",
    })
    appLanguage: AppLanguageEntity;
}
