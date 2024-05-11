import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    Request,
    Post,
    Body,
    Put,
    Query,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../../guards/account-types.guard";
import { AccountTypes } from "../../../decorators/account-types.decorator";
import { AccountType } from "../../core/user/account-type.enum";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { I18nLang } from "nestjs-i18n";
import { CompanyService } from "../services/company.service";
import { UpdateCompanyDto } from "../dto/request/update_company.dto";
import { CreatedCompanyDto } from "../dto/response/created_company.dto";
import { CompanyEntityDto } from "../dto/response/company_entity.dto";
import { CreatedCompanyPlanDatesDto } from "../dto/response/created_company_plan_dates.dto";
import { CreateCompanyPlanDatesDto } from "../dto/request/create_company_plan_dates.dto";
import { UpdateCompanyPlanDatesDto } from "../dto/request/update_company_plan_dates.dto";
import { EmployeeNodeDto } from "../../employee/dto/response/org_chart_employee_node.dto";
import { GetOrgChartQueryDto } from "../dto/request/org_chart_query.dto";
import { CompanyFinancialYearsDto } from "../dto/response/company_financial_years.dto";
import { UpdateFinancialYearsDto } from "../dto/request/update_company_financial_years.dto";

@Controller("company")
@ApiTags("Company")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class CompanyController {
    constructor(public readonly companyService: CompanyService) { }

    @Get("settings")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company settings" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company successfully",
        type: CreatedCompanyDto,
    })
    @ApiBearerAuth()
    getCompany(@Request() req, @I18nLang() lang: string): Promise<CompanyEntityDto> {
        return this.companyService.getUserCompany(req.user, lang);
    }

    @Put("settings")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update company" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Company updated successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateCompanySettings(@Request() req, @Body() updateCompanyDto: UpdateCompanyDto, @I18nLang() lang: string) {
        return this.companyService.updateCompanySettings(req.user, lang, updateCompanyDto);
    }

    @Post("budget-dates")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create company plan start and end dates" })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: "Created company plan dates successfully",
        type: CreatedCompanyPlanDatesDto,
    })
    @ApiBearerAuth()
    createCompanyPlanDates(
        @Request() req,
        @Body() createPlanDatesDto: CreateCompanyPlanDatesDto,
        @I18nLang() lang: string,
    ): Promise<CreatedCompanyPlanDatesDto> {
        return this.companyService.createCompanyPlanDates(req.user, createPlanDatesDto, lang);
    }

    @Get("budget-dates")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company plan dates" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "returns date string values or null values if no plan was created for this company",
        type: CreatedCompanyPlanDatesDto,
    })
    @ApiBearerAuth()
    getCompanyPlanDates(@Request() req, @I18nLang() lang: string): Promise<CreatedCompanyPlanDatesDto> {
        return this.companyService.getCompanyPlanDates(req.user, lang);
    }

    @Put("budget-dates")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update company plan dates" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated company plan dates successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateCompanyBudgetDates(
        @Request() req,
        @Body() updatePlanDatesDto: UpdateCompanyPlanDatesDto,
        @I18nLang() lang: string,
    ) {
        return this.companyService.updateCompanyPlanDates(req.user, updatePlanDatesDto, lang);
    }

    @Get("financial-years")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company financial years" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "returns number of financial years",
        type: CompanyFinancialYearsDto,
    })
    @ApiBearerAuth()
    getCompanyFinancialYears(@Request() req, @I18nLang() lang: string): Promise<CompanyFinancialYearsDto> {
        return this.companyService.getCompanyFinancialYears(req.user, lang);
    }

    @Put("financial-years")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update company financial years" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated company financial years successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateCompanyFinancialYears(
        @Request() req,
        @Body() updateFinancialYearsDto: UpdateFinancialYearsDto,
        @I18nLang() lang: string,
    ) {
        return this.companyService.updateCompanyFinancialYears(req.user, updateFinancialYearsDto, lang);
    }

    @Get("org-chart")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company organization chart" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company organization chart successfully",
        type: [EmployeeNodeDto],
    })
    @ApiBearerAuth()
    getUserCompanyOrganizationChart(
        @Request() req,
        @Query(ValidationPipe) orgChartQueryDto: GetOrgChartQueryDto,
        @I18nLang() lang: string,
    ): Promise<EmployeeNodeDto[]> {
        return this.companyService.getUserCompanyOrganizationChart(req.user, orgChartQueryDto, lang);
    }
}
