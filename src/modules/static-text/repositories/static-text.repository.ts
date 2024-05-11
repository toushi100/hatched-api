import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { StaticTextEntity } from "../entities/static-text.entity";
import { StaticTextCategoryEnum } from "../static-text-category.enum";
import { StaticTextCategoryAndTextKeyParamDto } from "../dto/static-text-category-and-text-key-param.dto";

@EntityRepository(StaticTextEntity)
export class StaticTextRepository extends Repository<StaticTextEntity> {
  async getStaticTextByKey(
    staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
    languageCode: string
  ): Promise<StaticTextEntity> {
    const query = this.createQueryBuilder("staticText")
      .leftJoinAndSelect(
        "staticText.staticTextTranslations",
        "staticTextTranslation",
        "staticTextTranslation.appLanguage.languageCode = :languageCode",
        { languageCode }
      )
      .leftJoinAndSelect("staticTextTranslation.appLanguage", "Language")
      .select([
        "staticText.textKey",
        "staticText.keyDescription",
        "staticText.categoryName",
        "staticTextTranslation.value",
        "Language.languageCode"
      ])
      .where("staticText.categoryName = :category AND staticText.textKey = :textKey", {
        textKey : staticTextCategoryAndTextKeyParamDto.textKey,
        category: staticTextCategoryAndTextKeyParamDto.staticTextCategory,
      });
    return query.getOne();
  }

  async getStaticTextsByCategory(
    staticTextCategory: StaticTextCategoryEnum,
    languageCode: string
  ): Promise<StaticTextEntity[]> {
    const query = this.createQueryBuilder("staticText")
      .leftJoinAndSelect("staticText.staticTextTranslations", "staticTextTranslation")
      .leftJoinAndSelect("staticTextTranslation.appLanguage", "Language")
      .select([
        "staticText.textKey",
        "staticText.keyDescription",
        "staticText.categoryName",
        "staticTextTranslation.value",
        "Language.languageCode"
      ])
      .where("staticText.categoryName = :category AND Language.languageCode = :code", {
        code: languageCode,
        category: staticTextCategory
      });
    return query.getMany();
  }
}
