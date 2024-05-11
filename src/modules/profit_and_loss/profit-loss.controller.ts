import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Put,
    Request,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { ProfitLossService } from "./services/profit-loss.service";
import { AccountTypes } from "../../decorators/account-types.decorator";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountType } from "../core/user/account-type.enum";
import { UpdateActualBudgetItemDto } from "./dto/request/update_actual_budget_item.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { I18nLang } from "nestjs-i18n";
import { ActualBudgetMonthDto } from "./dto/response/actual_budget_month.dto";
import { ActualBudgetItemDto } from "./dto/response/actual_budget_item.dto";
import { UpdateActualBudgetMonthItemDto } from "./dto/request/update_actual_budget_month_item.dto";
import { ActualBudgetMonthItemDto } from "./dto/response/actual_budget_month_item.dto";
import { ActualBudgetItemsListDto } from "./dto/response/actual_budget_items_list.dto";

@Controller("profit_loss")
@ApiTags("Profit and Loss")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class ProfitLossController {
    constructor(public readonly profitLossService: ProfitLossService) { }

    @Get("actual/months")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get actual budget months list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved actual budget months list successfully",
        type: [ActualBudgetMonthDto],
    })
    @ApiBearerAuth()
    getActualBudgetMonths(
        @Request() req,
        @I18nLang() lang: string,
    ): Promise<ActualBudgetMonthDto[]> {
        return this.profitLossService.getActualBudgetMonths(req.user, lang);
    }

    @Get("actual/items")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get actual budget items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved actual budget items list successfully",
        type: [ActualBudgetItemDto],
    })
    @ApiBearerAuth()
    getActualBudgetItems(
        @Request() req,
        @I18nLang() lang: string,
    ): Promise<ActualBudgetItemDto[]> {
        return this.profitLossService.getActualBudgetItems(req.user, lang);
    }

    @Put("actual/:id/months/:monthId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update actual budget month item" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated actual budget month item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateOneActualBudgetMonth(
        @Request() req,
        @Param("id", ParseIntPipe) actualBudgetItemId: number,
        @Param("monthId", ParseIntPipe) actualBudgetMonthItemId: number,
        @Body() updateActualBudgetMonthItemDto: UpdateActualBudgetMonthItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.profitLossService.updateOneActualBudgetMonth(
            req.user,
            actualBudgetItemId,
            actualBudgetMonthItemId,
            updateActualBudgetMonthItemDto,
            lang);
    }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get actual budget items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved actual budget items list successfully",
        type: ActualBudgetItemsListDto,
    })
    @ApiBearerAuth()
    getActualBudgetItemsTableData(@Request() req, @I18nLang() lang: string,): Promise<ActualBudgetItemsListDto> {
        return this.profitLossService.getActualBudgetItemsTableData(req.user, lang);
    }

    @Get("actual/:id/months/:monthId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get actual budget month item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved actual budget month item by id successfully",
        type: ActualBudgetMonthItemDto,
    })
    @ApiBearerAuth()
    getBudgetItemMonthById(
        @Request() req,
        @Param("id", ParseIntPipe) actualBudgetItemId: number,
        @Param("monthId", ParseIntPipe) actualBudgetMonthItemId: number,
        @I18nLang() lang: string,
    ): Promise<ActualBudgetMonthItemDto> {
        return this.profitLossService.getOneActualBudgetMonth(
            req.user,
            actualBudgetItemId,
            actualBudgetMonthItemId,
            lang);
    }

    @Put("actual")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update actual budget month item." })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated actual budget month item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateActualBudgetMonthItem(
        @Request() req,
        @Body() updateActualBudgetItemDto: UpdateActualBudgetItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.profitLossService.updateActualBudgetMonthItem(
            req.user,
            updateActualBudgetItemDto,
            lang);
    }
}
