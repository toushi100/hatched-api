import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { BudgetItemService } from "./services/budget-item.service";
import { I18nLang } from "nestjs-i18n";
import { CreatedBudgetItemDto } from "./dto/response/created_budget_item.dto";
import { CreateBudgetItemDto } from "./dto/request/create_budget_item.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { UpdateBudgetMonthItemDto } from "./dto/request/update_budget_month_item.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AccountTypes } from "../../../decorators/account-types.decorator";
import { AccountType } from "../../../modules/core/user/account-type.enum";
import { AccountTypeGuard } from "../../../guards/account-types.guard";
import { BudgetItemsListDto } from "./dto/response/budget_items_list.dto";
import {
    BudgetDirectCostsCurrentValueCalculation,
    BudgetDirectCostsFutureGrowth,
    BudgetDirectCostsItemDto,
    BudgetDirectCostsManualCurrentValue,
} from "./dto/request/direct_cost_data.dto";
import { BudgetRevenueCurrentValueCalculation, BudgetRevenueFutureGrowth, BudgetRevenueItemDto, BudgetRevenueManualCurrentValue, BudgetRevenueManualFutureGrowth } from "./dto/request/revenue_data.dto";
import { BudgetOtherItemsDto } from "./dto/request/other_data.dto";
import { UpdateBudgetItemDto } from "./dto/request/update_budget_item.dto";
import { BudgetMonthItemDto } from "./dto/response/budget_month_item.dto";

@Controller("budget-items")
@ApiTags("Budget Item")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
@ApiExtraModels(
    BudgetDirectCostsItemDto,
    BudgetRevenueItemDto,
    BudgetOtherItemsDto,
    BudgetDirectCostsCurrentValueCalculation,
    BudgetDirectCostsManualCurrentValue,
    BudgetDirectCostsFutureGrowth,
    BudgetRevenueManualCurrentValue,
    BudgetRevenueManualFutureGrowth,
    BudgetRevenueCurrentValueCalculation,
    BudgetRevenueFutureGrowth,
)
export class BudgetItemController {
    constructor(public readonly budgetItemService: BudgetItemService) { }

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Create a new budget item and the months." })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Created budget item successfully",
        type: CreatedBudgetItemDto,
    })
    @ApiBearerAuth()
    createBudgetItem(
        @Request() req,
        @Body() createBudgetItemDto: CreateBudgetItemDto,
        @I18nLang() lang: string,
    ): Promise<CreatedBudgetItemDto> {
        return this.budgetItemService.createBudgetItem(req.user, createBudgetItemDto, lang);
    }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get budget items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved budget items list successfully",
        type: BudgetItemsListDto,
    })
    @ApiBearerAuth()
    getBudgetItems(@Request() req): Promise<BudgetItemsListDto> {
        return this.budgetItemService.getBudgetItems(req.user);
    }

    @Get(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get budget item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved budget item by id successfully",
        type: CreatedBudgetItemDto,
    })
    @ApiBearerAuth()
    getBudgetItemById(
        @Request() req,
        @Param("id", ParseIntPipe) budgetItemId: number,
        @I18nLang() lang: string,
    ): Promise<CreatedBudgetItemDto> {
        return this.budgetItemService.getBudgetItemById(req.user, budgetItemId, lang);
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update budget item" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated budget item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateBudgetItem(
        @Request() req,
        @Param("id", ParseIntPipe) budgetItemId: number,
        @Body() updateBudgetItemDto: UpdateBudgetItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.budgetItemService.updateBudgetItem(req.user, budgetItemId, updateBudgetItemDto, lang);
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete budget item" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted budget item successfully",
        type: BasicOperationsResponse,
    })
    deleteBudgetItem(
        @Request() req,
        @Param("id", ParseIntPipe) budgetItemId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.budgetItemService.deleteBudgetItem(req.user, budgetItemId, lang);
    }

    @Put(":id/month/:monthId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update budget month item" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated budget month item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateBudgetMonthItem(
        @Request() req,
        @Param("id", ParseIntPipe) budgetItemId: number,
        @Param("monthId", ParseIntPipe) budgetMonthItemId: number,
        @Body() updateBudgetMonthItemDto: UpdateBudgetMonthItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.budgetItemService.updateBudgetMonthItem(
            req.user,
            budgetItemId,
            budgetMonthItemId,
            updateBudgetMonthItemDto,
            lang);
    }

    @Get(":id/month/:monthId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get budget month item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved budget month item by id successfully",
        type: BudgetMonthItemDto,
    })
    @ApiBearerAuth()
    getBudgetItemMonthById(
        @Request() req,
        @Param("id", ParseIntPipe) budgetItemId: number,
        @Param("monthId", ParseIntPipe) budgetMonthItemId: number,
        @I18nLang() lang: string,
    ): Promise<BudgetMonthItemDto> {
        return this.budgetItemService.getBudgetMonthItemById(
            req.user,
            budgetItemId,
            budgetMonthItemId,
            lang);
    }

}
