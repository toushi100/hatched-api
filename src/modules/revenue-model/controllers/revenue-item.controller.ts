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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { RevenueModelService } from "../revenue-model.service";
import { I18nLang } from "nestjs-i18n";
import { CreateRevenueItemDto } from "../dto/request/create_revenue_item.dto";
import { UpdateRevenueItemDto } from "../dto/request/update_revenue_item.dto";
import { CreatedRevenueItemDto } from "../dto/response/created_revenue_item.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { AccountTypes } from "../../../decorators/account-types.decorator";
import { AccountType } from "../../core/user/account-type.enum";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../../guards/account-types.guard";

@Controller("revenue-items")
@ApiTags("Revenue Item")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class RevenueItemController {
    constructor(public readonly revenueModelService: RevenueModelService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get revenue items list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved revenue items list successfully",
        type: [CreatedRevenueItemDto],
    })
    @ApiBearerAuth()
    getRevenueItemsList(@Request() req): Promise<CreatedRevenueItemDto[]> {
        return this.revenueModelService.getRevenueItemsList(req.user);
    }

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Create a bulk of revenue items" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Created revenue items successfully",
        type: [CreatedRevenueItemDto],
    })
    @ApiBearerAuth()
    createRevenueItem(
        @Request() req,
        @Body() createRevItemDto: CreateRevenueItemDto,
        @I18nLang() lang: string,
    ): Promise<CreatedRevenueItemDto[]> {
        console.log(createRevItemDto);
        return this.revenueModelService.createRevenueItem(req.user, createRevItemDto, lang);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get revenue item by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved revenue item successfully",
        type: CreatedRevenueItemDto,
    })
    @ApiBearerAuth()
    getRevenueItem(
        @Param("id", ParseIntPipe) itemId: number,
        @I18nLang() lang: string,
    ): Promise<CreatedRevenueItemDto> {
        return this.revenueModelService.getRevenueItemById(itemId, lang);
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update revenue item" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated revenue item successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateRevenueItem(
        @Request() req,
        @Param("id", ParseIntPipe) itemId: number,
        @Body() updateRevItemDto: UpdateRevenueItemDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.revenueModelService.updateRevenueItem(req.user, itemId, updateRevItemDto, lang);
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete revenue item" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted revenue item successfully",
        type: BasicOperationsResponse,
    })
    deleteRevenueItem(
        @Request() req,
        @Param("id", ParseIntPipe) itemId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.revenueModelService.deleteRevenueItem(req.user, itemId, lang);
    }
}
