import { Controller, Get, HttpCode, HttpStatus, Query, Request, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { ValuationService } from "./valuation.service";
import { I18nLang } from "nestjs-i18n";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { GetValuationDto } from "./dto/request/get_valuation.dto";
import { ValuationItemListDto } from "./dto/response/valuation_item_list.dto";

@Controller("valuation")
@ApiTags("Valuation")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class ValuationController {
    constructor(public readonly valuationService: ValuationService) { }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get valuation data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved valuation data successfully",
        type: [ValuationItemListDto],
    })
    @ApiBearerAuth()
    getValuationData(
        @Request() req,
        @Query(ValidationPipe) getValuationDto: GetValuationDto,
        @I18nLang() lang,
    ): Promise<ValuationItemListDto[]> {
        return this.valuationService.getValuationData(req.user, getValuationDto, lang);
    }
}
