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
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { ESOPService } from "./esop.service";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { ESOPDto } from "./dto/response/esop.dto";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "../../decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { I18nLang } from "nestjs-i18n";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { CreateESOPDto } from "./dto/request/create_esop.dto";
import { UpdateESOPDto } from "./dto/request/update_esop.dto";
import { ESOPSharesDataDto } from "./dto/response/esop_shares_data.dto";
import { UpdateTotalSharesDto } from "./dto/request/update_total_shares.dto";

@Controller("esop")
@ApiTags("ESOP")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class ESOPController {
    constructor(public readonly esopService: ESOPService) {}

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create an ESOP" })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: "ESOP Created Successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    createNewESOP(
        @Request() req,
        @Body() createESOPDto: CreateESOPDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.esopService.createNewESOP(req.user, createESOPDto, lang);
    }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get ESOPs list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved ESOPs list successfully",
        type: [ESOPDto],
    })
    @ApiBearerAuth()
    getESOPsList(@Request() req): Promise<ESOPDto[]> {
        return this.esopService.getESOPsList(req.user);
    }

    @Put("total-shares")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Update company's total allocated shares for ESOPs" })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: "Total allocated shares updated successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateTotalAllocatedShares(
        @Request() req,
        @Body() updateTotalSharesDto: UpdateTotalSharesDto,
        @I18nLang() lang: string,
    ) {
        return this.esopService.updateTotalAllocatedShares(req.user, updateTotalSharesDto, lang);
    }

    @Get("shares-data")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get shares numbers regarding company ESOPs" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved shares numbers successfully",
        type: ESOPSharesDataDto,
    })
    @ApiBearerAuth()
    getSharesDataForESOPs(@Request() req, @I18nLang() lang: string): Promise<ESOPSharesDataDto> {
        return this.esopService.getSharesDataForESOPs(req.user, lang);
    }

    @Get(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get ESOP by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved ESOP successfully",
        type: ESOPDto,
    })
    @ApiBearerAuth()
    async getESOPById(
        @Request() req,
        @Param("id", ParseIntPipe) planId: number,
        @I18nLang() lang: string,
    ): Promise<ESOPDto> {
        const esop = (await this.esopService.getESOPById(req.user, planId, lang)) as ESOPDto;
        return esop;
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update ESOP by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "ESOP updated successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateESOPById(
        @Request() req,
        @Param("id", ParseIntPipe) planId: number,
        @Body() updateESOPDto: UpdateESOPDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.esopService.updateESOPById(req.user, planId, updateESOPDto, lang);
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete ESOP by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "ESOP deleted successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    deleteESOPById(
        @Request() req,
        @Param("id", ParseIntPipe) planId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.esopService.deleteESOPById(req.user, planId, lang);
    }
}
