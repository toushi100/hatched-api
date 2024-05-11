import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { StaticTextRepository } from "./repositories/static-text.repository";
import { StaticTextTranslationRepository } from "./repositories/static-text-translation.repository";
import { StaticTextUpdateDto } from "./dto/static-text-update.dto";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { StaticTextKeys } from "./translate.enum";
import { StaticTextEntity } from "./entities/static-text.entity";
import { StaticTextDto } from "./dto/static-text.dto";
import { StaticTextMapper } from "./static-text.mapper";
import { languagesCodes } from "../../constants/languages";
import { StaticTextCategoryEnum } from "./static-text-category.enum";
import { StaticTextCategoryAndTextKeyParamDto } from "./dto/static-text-category-and-text-key-param.dto";

@Injectable()
export class StaticTextService {
    constructor(
        public readonly staticTextRepository: StaticTextRepository,
        public readonly staticTextTranslationRepository: StaticTextTranslationRepository,
        public readonly staticTextMapper: StaticTextMapper,
        private readonly i18n: I18nService
    ) {
    }

    public async getStaticTextCategories(): Promise<String[]> {
        return Object.values(StaticTextCategoryEnum);
    }

    public async getStaticTextByKey(
        staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
        language: string
    ): Promise<StaticTextDto> {
        const languageCode = languagesCodes[ language ] || languagesCodes.Default;
        const result = await this.staticTextRepository.getStaticTextByKey(staticTextCategoryAndTextKeyParamDto, languageCode);
        if (!result) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(StaticTextKeys.NOT_FOUND ,{
                        lang: languageCode
                    })
                },
                HttpStatus.NOT_FOUND
            );
        }
        return this.staticTextMapper.fromEntityToDTO(StaticTextDto, result);
    }

    public async getStaticTextsByCategory(
        staticTextCategory: StaticTextCategoryEnum,
        language: string
    ): Promise<StaticTextDto[]> {
        const languageCode: string = languagesCodes[ language ] || languagesCodes.Default;
        const result = await this.staticTextRepository.getStaticTextsByCategory(staticTextCategory, languageCode);
        if (!result) {
            return [];
        }
        return result.map((staticText: StaticTextEntity) =>
            this.staticTextMapper.fromEntityToDTO(StaticTextDto, staticText)
        );
    }

    public async updateStaticTextValue(
        newStaticTextData: StaticTextUpdateDto,
        staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
        language: string
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[ language ] || languagesCodes.Default;
        const updateResult = await this.staticTextTranslationRepository.updateStaticTextValue(
            newStaticTextData,
            staticTextCategoryAndTextKeyParamDto,
            language
        );

        if (updateResult.affected === 0) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(StaticTextKeys.NOT_FOUND, {
                        lang: languageCode
                    })
                },
                HttpStatus.NOT_FOUND
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(StaticTextKeys.UPDATE_SUCCESSFUL, {
                lang: languageCode
            })
        };
    }
}
