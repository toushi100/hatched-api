import {
    Body,
    CACHE_MANAGER,
    CacheTTL,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Put,
    UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { I18nLang } from "nestjs-i18n";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { StaticTextService } from "./static-text.service";
import { StaticTextDto } from "./dto/static-text.dto";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { StaticTextUpdateDto } from "./dto/static-text-update.dto";
import { StaticTextCategoryEnum } from "./static-text-category.enum";
import { StaticTextCategoryParamDto } from "./dto/static-text-category-param.dto";
import { StaticTextCategoryAndTextKeyParamDto } from "./dto/static-text-category-and-text-key-param.dto";
import { HttpCacheInterceptor } from "../../interceptors/http-cache.interceptor";
import { Cache } from "cache-manager";

@Controller("static-text")
@ApiTags("Static Text")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes
})
@UseInterceptors(LanguageInterceptor)
@UseInterceptors(HttpCacheInterceptor)
export class StaticTextsController {
    constructor(
        public readonly staticTextService: StaticTextService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @CacheTTL(86400)
    @ApiOperation({ summary: "Get static text categories" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "static texts categories",
        type: [String]
    })
    getStaticTextCategories(): Promise<String[]> {
        return this.staticTextService.getStaticTextCategories();
    }

    @Get(":staticTextCategory")
    @HttpCode(HttpStatus.OK)
    @CacheTTL(86400)
    @ApiOperation({ summary: "Get category's static texts" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Category's static texts",
        type: [StaticTextDto]
    })
    @ApiParam({ name: "staticTextCategory", enum: StaticTextCategoryEnum })
    getStaticTexts(
        @Param() staticTextCategoryParamDto: StaticTextCategoryParamDto,
        @I18nLang() lang: string
    ): Promise<StaticTextDto[]> {
        return this.staticTextService.getStaticTextsByCategory(staticTextCategoryParamDto.staticTextCategory, lang);
    }

    @Put(":staticTextCategory/:textKey")
    @ApiOperation({ summary: "Update category's static text" })
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        type: BasicOperationsResponse
    })
    @ApiParam({ name: "staticTextCategory", enum: StaticTextCategoryEnum })
    updateStaticKey(
        @Param() staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
        @Body() staticTextDto: StaticTextUpdateDto,
        @I18nLang() lang: string
    ): Promise<BasicOperationsResponse> {
        const updated = this.staticTextService.updateStaticTextValue(
            staticTextDto,
            staticTextCategoryAndTextKeyParamDto,
            lang
        );
        this.cacheManager.reset();
        return updated;
    }

    @Get(":staticTextCategory/:textKey")
    @ApiOperation({ summary: "Get category's static text" })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Static Text",
        type: StaticTextDto
    })
    @ApiParam({ name: "staticTextCategory", enum: StaticTextCategoryEnum })
    getStaticTextByKey(
        @Param() staticTextCategoryAndTextKeyParamDto: StaticTextCategoryAndTextKeyParamDto,
        @I18nLang() lang: string
    ): Promise<StaticTextDto> {
        return this.staticTextService.getStaticTextByKey(staticTextCategoryAndTextKeyParamDto, lang);
    }
}
