import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { I18nLang } from "nestjs-i18n";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { InvestorService } from "./investor.service";
import { GetValuationDto } from "../valuation/dto/request/get_valuation.dto";
import { CaptableItemDto } from "../captable/dto/response/captable_item.dto";
import { InvestorCompanyListItemDto } from "./dto/response/investor_company_list_item.dto";
import { ValuationItemListDto } from "../valuation/dto/response/valuation_item_list.dto";
import { EmployeeNodeDto } from "../employee/dto/response/org_chart_employee_node.dto";
import { GetOrgChartQueryDto } from "../company/dto/request/org_chart_query.dto";
import { ActualBudgetItemsListDto } from "../profit_and_loss/dto/response/actual_budget_items_list.dto";
import { InvestorCompanyInfoDto } from "./dto/response/investor_company_info.dto";

@Controller("investor")
@ApiTags("Investor")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class InvestorController {
    constructor(public readonly investorService: InvestorService) { }

    @Get("company/")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get companies list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved companies list successfully",
        type: [InvestorCompanyListItemDto],
    })
    @ApiBearerAuth()
    getCompanies(@Request() req, @I18nLang() lang): Promise<InvestorCompanyListItemDto[]> {
        return this.investorService.getCompaniesList(req.user, lang);
    }

    @Get("company/:id")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company info" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company successfully",
        type: InvestorCompanyInfoDto,
    })
    @ApiBearerAuth()
    getCompanyById(
        @Request() req,
        @Param("id", ParseIntPipe) companyId: number,
        @I18nLang() lang,
    ): Promise<InvestorCompanyInfoDto> {
        return this.investorService.getCompanyById(req.user, companyId, lang);
    }

    @Get("company/:id/valuation")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company valuation data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company valuation data successfully",
        type: [ValuationItemListDto],
    })
    @ApiBearerAuth()
    getCompanyValuationData(
        @Request() req,
        @Param("id", ParseIntPipe) companyId: number,
        @Query(ValidationPipe) getValuationDto: GetValuationDto,
        @I18nLang() lang,
    ): Promise<ValuationItemListDto[]> {
        return this.investorService.getCompanyValuationData(req.user, companyId, getValuationDto, lang);
    }

    @Get("company/:id/captable")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company cap table data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company cap table data successfully",
        type: [CaptableItemDto],
    })
    @ApiBearerAuth()
    getCompanyCapTableData(
        @Request() req,
        @Param("id", ParseIntPipe) companyId: number,
        @I18nLang() lang,
    ): Promise<CaptableItemDto[]> {
        return this.investorService.getCompanyCapTableData(req.user, companyId, lang);
    }

    @Get("company/:id/org-chart")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company organization chart" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company organization chart successfully",
        type: [EmployeeNodeDto],
    })
    @ApiBearerAuth()
    getCompanyOrganizationChart(
        @Param("id", ParseIntPipe) companyId: number,
        @Query(ValidationPipe) orgChartQueryDto: GetOrgChartQueryDto,
        @I18nLang() lang,
    ): Promise<EmployeeNodeDto[]> {
        return this.investorService.getCompanyOrganizationChart(companyId, orgChartQueryDto, lang);
    }

    @Get("company/:id/profit_loss")
    @AccountTypes(AccountType.INVESTOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company actual budget items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company actual budget items list successfully",
        type: ActualBudgetItemsListDto,
    })
    @ApiBearerAuth()
    getCompanyActualBudgetItems(
        @Request() req,
        @Param("id", ParseIntPipe) companyId: number,
        @I18nLang() lang,
    ): Promise<ActualBudgetItemsListDto> {
        return this.investorService.getCompanyActualBudgetItems(req.user, companyId, lang);
    }
}
