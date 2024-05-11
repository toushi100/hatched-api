import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Put,
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
import { GetValuationDto } from "../valuation/dto/request/get_valuation.dto";
import { CaptableItemDto } from "../captable/dto/response/captable_item.dto";
import { AcceleratorCompanyListItemDto } from "./dto/response/accelerator_company_list_item.dto";
import { AcceleratorService } from "./accelerator.service";
import { AcceleratorItemDto } from "./dto/response/created_accelerator.dto";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { UpdateAcceleratorDto } from "./dto/request/update_accelerator.dto";
import { AcceleratorListItemDto } from "./dto/response/accelerator_list_item.dto";
import { ValuationItemListDto } from "../valuation/dto/response/valuation_item_list.dto";
import { GetOrgChartQueryDto } from "../company/dto/request/org_chart_query.dto";
import { EmployeeNodeDto } from "../employee/dto/response/org_chart_employee_node.dto";
import { ActualBudgetItemsListDto } from "../profit_and_loss/dto/response/actual_budget_items_list.dto";
import { AcceleratorCompanyInfoDto } from "./dto/response/accelerator_company_info.dto";

@Controller("accelerator")
@ApiTags("Accelerator")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class AcceleratorController {
    constructor(public readonly acceleratorService: AcceleratorService) { }

    @Get("company/")
    @AccountTypes(AccountType.ACCELERATOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get companies list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved companies list successfully",
        type: [AcceleratorCompanyListItemDto],
    })
    @ApiBearerAuth()
    getCompanies(@Request() req, @I18nLang() lang): Promise<AcceleratorCompanyListItemDto[]> {
        return this.acceleratorService.getCompaniesList(req.user, lang);
    }

    @Get("company/:id")
    @AccountTypes(AccountType.ACCELERATOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company info" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company successfully",
        type: AcceleratorCompanyInfoDto,
    })
    @ApiBearerAuth()
    getCompanyById(
        @Request() req,
        @Param("id", ParseIntPipe) companyId: number,
        @I18nLang() lang,
    ): Promise<AcceleratorCompanyInfoDto> {
        return this.acceleratorService.getCompanyById(req.user, companyId, lang);
    }

    @Get("/")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get accelerators  list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved accelerators list successfully",
        type: [AcceleratorListItemDto],
    })
    @ApiBearerAuth()
    getAccelerators(@Request() req, @I18nLang() lang): Promise<AcceleratorListItemDto[]> {
        return this.acceleratorService.getAll();
    }

    @Get("settings/")
    @AccountTypes(AccountType.ACCELERATOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get accelerator settings" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved accelerator settings successfully",
        type: [AcceleratorItemDto],
    })
    @ApiBearerAuth()
    getUserAccelerator(@Request() req, @I18nLang() lang): Promise<AcceleratorItemDto> {
        return this.acceleratorService.getAccelerator(req.user, lang);
    }

    @Put("settings/")
    @AccountTypes(AccountType.ACCELERATOR)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update accelerator settings" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated the accelerator settings successfully",
        type: [BasicOperationsResponse],
    })
    @ApiBearerAuth()
    updateUserAccelerator(
        @Request() req,
        @I18nLang() lang,
        @Body() updateAcceleratorDto: UpdateAcceleratorDto,
    ): Promise<BasicOperationsResponse> {
        return this.acceleratorService.updateAcceleratorSettings(req.user, lang, updateAcceleratorDto);
    }

    @Get("company/:id/valuation")
    @AccountTypes(AccountType.ACCELERATOR)
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
        return this.acceleratorService.getCompanyValuationData(req.user, companyId, getValuationDto, lang);
    }

    @Get("company/:id/captable")
    @AccountTypes(AccountType.ACCELERATOR)
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
        return this.acceleratorService.getCompanyCapTableData(req.user, companyId, lang);
    }

    @Get("company/:id/org-chart")
    @AccountTypes(AccountType.ACCELERATOR)
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
        return this.acceleratorService.getCompanyOrganizationChart(companyId, orgChartQueryDto, lang);
    }

    @Get("company/:id/profit_loss")
    @AccountTypes(AccountType.ACCELERATOR)
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
        return this.acceleratorService.getCompanyActualBudgetItems(req.user, companyId, lang);
    }
}
