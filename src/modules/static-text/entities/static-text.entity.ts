import { Expose } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { StaticTextTranslationEntity } from "./static-text-translation.entity";
import { StaticTextCategoryEnum } from "../static-text-category.enum";

@Entity("static_text")
@Unique(["textKey", "categoryName"])
export class StaticTextEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "static_text_id",
    })
    @Expose()
    id: number;

    @Column({
        name: "text_key",
        type: "varchar",
    })
    @Expose()
    textKey: string;

    @Column({
        name: "Key_description",
        type: "varchar",
    })
    @Expose()
    keyDescription: string;

    @Column({
        name: "category_name",
        type: "enum",
        nullable: false,
        enum: StaticTextCategoryEnum,
        default: StaticTextCategoryEnum.DASHBOARD,
    })
    @Expose()
    categoryName: StaticTextCategoryEnum;

    @OneToMany((_type) => StaticTextTranslationEntity, (staticTextTranslation) => staticTextTranslation.staticText, {
        cascade: true,
    })
    staticTextTranslations: StaticTextTranslationEntity[];
}
