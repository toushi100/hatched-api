import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { CaptableService } from "./captable.service";
import { I18nLang } from "nestjs-i18n";
import { CaptableItemDto } from "./dto/response/captable_item.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";

@Controller("captable")
@ApiTags("Captable")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class CaptableController {
    constructor(public readonly captableService: CaptableService) {}

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get captable data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved captable data successfully",
        type: [CaptableItemDto],
    })
    @ApiBearerAuth()
    getCaptableData(@Request() req, @I18nLang() lang): Promise<CaptableItemDto[]> {
        return this.captableService.getCaptableData(req.user, lang);
    }
}
