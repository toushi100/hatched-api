import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { StaticTextTranslationEntity } from "../entities/static-text-translation.entity";
import { StaticTextUpdateDto } from "../dto/static-text-update.dto";
import { UpdateResult } from "typeorm/query-builder/result/UpdateResult";
import { StaticTextCategoryAndTextKeyParamDto } from "../dto/static-text-category-and-text-key-param.dto";

@EntityRepository(StaticTextTranslationEntity)
export class StaticTextTranslationRepository extends Repository<StaticTextTranslationEntity> {
  async updateStaticTextValue(
    newStaticTextData: StaticTextUpdateDto,
    staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
    language: string
  ): Promise<UpdateResult> {
    const queryIds = await this.createQueryBuilder("staticTextTranslation")
      .innerJoinAndSelect("staticTextTranslation.staticText", "staticText", "staticText.textKey = :textKey AND staticText.categoryName = :category", {
        textKey: staticTextCategoryAndTextKeyParamDto.textKey,
        category: staticTextCategoryAndTextKeyParamDto.staticTextCategory
      })
      .innerJoinAndSelect("staticTextTranslation.appLanguage", "appLanguage", "appLanguage.languageCode = :appLanguage", {
        appLanguage: language
      })
      .select([
        "staticTextTranslation.id"
      ]).getMany();

    const query = this.createQueryBuilder("staticTextTranslation")
      .update()
      .set({
        value: newStaticTextData.value
      })
      .whereInIds(queryIds);
    return await query.execute();
  }
}
