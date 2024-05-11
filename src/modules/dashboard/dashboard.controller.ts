import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { DashboardService } from "./dashboard.service";
import { I18nLang } from "nestjs-i18n";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import {
    DashboardFinancialNumbersDto,
    FinancialActualVsBudgetDto,
    FinancialNumbersAndChartsDto,
    FinancialPLBreakdownDto,
    FinancialSalesComponentsDto,
} from "./dto/response/financial.dtos";
import {
    DashboardHRNumbersDto,
    HRActualVsBudgetDto,
    HRNumbersAndChartsDto,
    HRStaffCostsAvg4MonthsDto,
    HRStaffCostsYTDDto,
} from "./dto/response/hr.dtos";

@Controller("dashboard")
@ApiTags("Dashboard")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class DashboardController {
    constructor(public readonly dashboardService: DashboardService) {}

    @Get("financial")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company's financial numbers and charts data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company's financial numbers and charts data successfully",
        type: FinancialNumbersAndChartsDto,
    })
    @ApiBearerAuth()
    getCompanyFinancialNumbersAndCharts(
        @Request() req,
        @I18nLang() lang: string,
    ): Promise<FinancialNumbersAndChartsDto> {
        return this.dashboardService.getCompanyFinancialNumbersAndCharts(req.user, lang);
    }

    @Get("financial/numbers")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company's financial numbers" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company's financial numbers successfully",
        type: DashboardFinancialNumbersDto,
    })
    @ApiBearerAuth()
    getCompanyFinancialNumbers(@Request() req, @I18nLang() lang: string): Promise<DashboardFinancialNumbersDto> {
        return this.dashboardService.getCompanyFinancialNumbers(req.user, lang);
    }

    @Get("financial/charts/actual-vs-budget")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial Actual vs Budget chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial Actual vs Budget chart data successfully",
        type: FinancialActualVsBudgetDto,
    })
    @ApiBearerAuth()
    getFinancialActualVsBudgetChartData(@Request() req, @I18nLang() lang: string): Promise<FinancialActualVsBudgetDto> {
        return this.dashboardService.getFinancialActualVsBudgetChartData(req.user, lang);
    }

    @Get("financial/charts/pl-breakdown")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial P&L breakdown chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial P&L breakdown chart successfully",
        type: FinancialPLBreakdownDto,
    })
    @ApiBearerAuth()
    getFinancialPLBreakdownChartData(@Request() req, @I18nLang() lang: string): Promise<FinancialPLBreakdownDto> {
        return this.dashboardService.getFinancialPLBreakdownChartData(req.user, lang);
    }

    @Get("financial/charts/sales-components")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial sales components chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial sales components chart data successfully",
        type: FinancialSalesComponentsDto,
    })
    @ApiBearerAuth()
    getFinancialSalesComponentsChartData(
        @Request() req,
        @I18nLang() lang: string,
    ): Promise<FinancialSalesComponentsDto> {
        return this.dashboardService.getFinancialSalesComponentsChartData(req.user, lang);
    }

    @Get("hr")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company's HR numbers and charts data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company's HR numbers and charts data successfully",
        type: HRNumbersAndChartsDto,
    })
    @ApiBearerAuth()
    getCompanyHRNumbersAndCharts(@Request() req, @I18nLang() lang: string): Promise<HRNumbersAndChartsDto> {
        return this.dashboardService.getCompanyHRNumbersAndCharts(req.user, lang);
    }

    @Get("hr/numbers")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company's HR numbers" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company's HR numbers successfully",
        type: DashboardHRNumbersDto,
    })
    @ApiBearerAuth()
    getCompanyHRNumbers(@Request() req, @I18nLang() lang: string): Promise<DashboardHRNumbersDto> {
        return this.dashboardService.getCompanyHRNumbers(req.user, lang);
    }

    @Get("hr/charts/staff-costs-ytd")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Staff Costs (YTD) chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved Staff Costs (YTD) chart data successfully",
        type: HRStaffCostsYTDDto,
    })
    @ApiBearerAuth()
    getHRStaffCostsYTDChartData(@Request() req, @I18nLang() lang: string): Promise<HRStaffCostsYTDDto> {
        return this.dashboardService.getHRStaffCostsYTDChartData(req.user, lang);
    }

    @Get("hr/charts/staff-costs-avg-4-months")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get HR Staff Costs (Avg. Last 4 Months) chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved HR Staff Costs (Avg. Last 4 Months) chart data successfully",
        type: HRStaffCostsAvg4MonthsDto,
    })
    @ApiBearerAuth()
    getHRStaffCostsAvg4MonthsChartData(@Request() req, @I18nLang() lang: string): Promise<HRStaffCostsAvg4MonthsDto> {
        return this.dashboardService.getHRStaffCostsAvg4MonthsChartData(req.user, lang);
    }

    @Get("hr/charts/actual-vs-budget")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get HR Actual Vs Budget chart data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved HR Actual Vs Budget chart data successfully",
        type: HRActualVsBudgetDto,
    })
    @ApiBearerAuth()
    getHRActualVsBudgetChartData(@Request() req, @I18nLang() lang: string): Promise<HRActualVsBudgetDto> {
        return this.dashboardService.getHRActualVsBudgetChartData(req.user, lang);
    }
}
