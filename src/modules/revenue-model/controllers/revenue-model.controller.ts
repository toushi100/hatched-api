import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { RevenueModelService } from "../revenue-model.service";
import { RevenueModelDto } from "../dto/response/revenue_model.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";

@Controller("revenue-models")
@ApiTags("Revenue Model")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class RevenueModelController {
    constructor(public readonly revenueModelService: RevenueModelService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get revenue model options list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved revenue models list successfully",
        type: [RevenueModelDto],
    })
    @ApiBearerAuth()
    getRevenueModelsOptions(): Promise<RevenueModelDto[]> {
        return this.revenueModelService.getRevenueModelOptionsList();
    }
}
