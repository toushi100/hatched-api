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
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { FinancialService } from "./services/financial.service";
import { I18nLang } from "nestjs-i18n";
import { CreatedFinancialItemDto } from "./dto/response/created_financial_item.dto";
import { CreateFinancialItemDto } from "./dto/request/create_financial_item.dto";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { UpdateFinancialQuarterItemDto } from "./dto/request/update_financial_quarter_item.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypes } from "../../decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import {
    FinancialDirectCostsCurrentValueCalculation,
    FinancialDirectCostsFutureGrowth,
    FinancialDirectCostsItemDto,
    FinancialDirectCostsManualCurrentValue,
} from "./dto/request/direct_cost_data.dto";
import { FinancialRevenueCurrentValueCalculation, FinancialRevenueFutureGrowth, FinancialRevenueItemDto, FinancialRevenueManualCurrentValue, FinancialRevenueManualFutureGrowth } from "./dto/request/revenue_data.dto";
import { FinancialOtherItemsDto } from "./dto/request/other_data.dto";
import { FinancialItemsListDto } from "./dto/response/financial_items_list.dto";
import { UpdateFinancialItemDto } from "./dto/request/update_financial_item.dto";
import { FinancialQuarterItemDto } from "./dto/response/financial_quarter_item.dto";

@Controller("financial")
@ApiTags("Financial")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
@ApiExtraModels(
    FinancialDirectCostsItemDto,
    FinancialRevenueItemDto,
    FinancialOtherItemsDto,
    FinancialDirectCostsCurrentValueCalculation,
    FinancialDirectCostsManualCurrentValue,
    FinancialDirectCostsFutureGrowth,
    FinancialRevenueManualCurrentValue,
    FinancialRevenueManualFutureGrowth,
    FinancialRevenueCurrentValueCalculation,
    FinancialRevenueFutureGrowth,
)
export class FinancialController {
    constructor(public readonly financialItemService: FinancialService) { }

    // @Post()
    // @AccountTypes(AccountType.STARTUP)
    // @UseGuards(JwtAuthGuard, AccountTypeGuard)
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: "Create a new financial item and the quarters." })
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     description: "Created financial item successfully",
    //     type: CreatedFinancialItemDto,
    // })
    // @ApiBearerAuth()
    // createFinancialItem(
    //     @Request() req,
    //     @Body() createFinancialItemDto: CreateFinancialItemDto,
    //     @I18nLang() lang: string,
    // ): Promise<CreatedFinancialItemDto> {
    //     return this.financialItemService.createFinancialItem(req.user, createFinancialItemDto, lang);
    // }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial items list successfully",
        type: FinancialItemsListDto,
    })
    @ApiBearerAuth()
    getFinancialItems(@Request() req): Promise<FinancialItemsListDto> {
        return this.financialItemService.getFinancialItems(req.user);
    }

    @Get(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial item by id successfully",
        type: CreatedFinancialItemDto,
    })
    @ApiBearerAuth()
    getFinancialItemById(
        @Request() req,
        @Param("id", ParseIntPipe) financialItemId: number,
        @I18nLang() lang: string,
    ): Promise<CreatedFinancialItemDto> {
        return this.financialItemService.getFinancialItemById(req.user, financialItemId, lang);
    }

    // @Put(":id")
    // @AccountTypes(AccountType.STARTUP)
    // @UseGuards(JwtAuthGuard, AccountTypeGuard)
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: "Update financial item" })
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     description: "Updated financial item successfully",
    //     type: BasicOperationsResponse,
    // })
    // @ApiBearerAuth()
    // updateFinancialItem(
    //     @Request() req,
    //     @Param("id", ParseIntPipe) financialItemId: number,
    //     @Body() updateFinancialItemDto: UpdateFinancialItemDto,
    //     @I18nLang() lang: string,
    // ): Promise<BasicOperationsResponse> {
    //     return this.financialItemService.updateFinancialItem(req.user, financialItemId, updateFinancialItemDto, lang);
    // }

    // @Delete(":id")
    // @AccountTypes(AccountType.STARTUP)
    // @UseGuards(JwtAuthGuard, AccountTypeGuard)
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: "Delete financial item" })
    // @ApiBearerAuth()
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     description: "Deleted financial item successfully",
    //     type: BasicOperationsResponse,
    // })
    // deleteFinancialItem(
    //     @Request() req,
    //     @Param("id", ParseIntPipe) financialItemId: number,
    //     @I18nLang() lang: string,
    // ): Promise<BasicOperationsResponse> {
    //     return this.financialItemService.deleteFinancialItem(req.user, financialItemId, lang);
    // }

    @Put(":id/quarter/:quarterId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update financial quarter item" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated financial quarter item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateFinancialQuarterItem(
        @Request() req,
        @Param("id", ParseIntPipe) financialItemId: number,
        @Param("quarterId", ParseIntPipe) financialQuarterItemId: number,
        @Body() updateFinancialQuarterItemDto: UpdateFinancialQuarterItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.financialItemService.updateFinancialQuarterItem(
            req.user,
            financialItemId,
            financialQuarterItemId,
            updateFinancialQuarterItemDto,
            lang);
    }

    @Get(":id/quarter/:quarterId")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get financial quarter item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved financial quarter item by id successfully",
        type: FinancialQuarterItemDto,
    })
    @ApiBearerAuth()
    getFinancialItemQuarterById(
        @Request() req,
        @Param("id", ParseIntPipe) financialItemId: number,
        @Param("quarterId", ParseIntPipe) financialQuarterItemId: number,
        @I18nLang() lang: string,
    ): Promise<FinancialQuarterItemDto> {
        return this.financialItemService.getFinancialQuarterItemById(
            req.user,
            financialItemId,
            financialQuarterItemId,
            lang);
    }
}
