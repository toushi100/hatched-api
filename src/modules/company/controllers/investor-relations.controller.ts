import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    Request,
    Body,
    Put,
    Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { InvestorRelationService } from "../services/investor-relation.service";
import { AccountTypeGuard } from "../../../guards/account-types.guard";
import { AccountTypes } from "../../../decorators/account-types.decorator";
import { AccountType } from "../../core/user/account-type.enum";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { InvestorRelationDto } from "../dto/response/investor-relation.dto";
import { UpdateInvestorRelationDto } from "../dto/request/update-investor-relation.dto";
import { DeleteInvestorRelationDto } from "../dto/request/delete-investor-relation.dto";
import { I18nLang } from "nestjs-i18n";

@Controller("company/investor-relations")
@ApiTags("Company")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class InvestorRelationsController {
    constructor(public readonly investorRelationsService: InvestorRelationService) {}

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get investors list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved investors list successfully",
        type: [InvestorRelationDto],
    })
    @ApiBearerAuth()
    getInvestorsList(@Request() req, @I18nLang() lang: string): Promise<InvestorRelationDto[]> {
        return this.investorRelationsService.getInvestorRelationsList(req.user, lang);
    }

    @Put()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update investor relation" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated investor relation successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateInvestorRelation(
        @Request() req,
        @Body() updateInvestorRelationDto: UpdateInvestorRelationDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.investorRelationsService.updateInvestorRelation(req.user, updateInvestorRelationDto, lang);
    }

    @Delete()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete investor relation" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted investor relation successfully",
        type: BasicOperationsResponse,
    })
    deleteInvestorRelation(
        @Request() req,
        @Body() deleteInvestorRelationDto: DeleteInvestorRelationDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.investorRelationsService.deleteInvestorRelation(req.user, deleteInvestorRelationDto, lang);
    }
}
