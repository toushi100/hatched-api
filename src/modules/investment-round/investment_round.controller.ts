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
import { InvestmentRoundService } from "./services/investment_round.service";
import { I18nLang } from "nestjs-i18n";
import { CreatedInvestmentRoundDto } from "./dto/response/created_investment_round.dto";
import { CreateInvestmentRoundDto } from "./dto/request/create_investment_round.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { UpdateInvestmentRoundDto } from "./dto/request/update_investment_round.dto";
import { InvestmentRoundsListDto } from "./dto/response/investment_rounds_list.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { GetCompanyInvestmentNumbersDto } from "./dto/response/get_company_investment_numbers.dto";

@Controller("investment-rounds")
@ApiTags("Investment Round")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class InvestmentRoundController {
    constructor(public readonly investmentRoundService: InvestmentRoundService) { }

    @Get("calculated-numbers")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get company investment round calculated numbers" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved company numbers successfully",
        type: GetCompanyInvestmentNumbersDto,
    })
    @ApiBearerAuth()
    getCompanyInvestmentCalculatedNumbers(
        @Request() req,
        @I18nLang() lang: string,
    ): Promise<GetCompanyInvestmentNumbersDto> {
        return this.investmentRoundService.getInvestmentRoundCalculatedNumbers(req.user, lang);
    }

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Create a new investment round" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Created investment round successfully",
        type: CreatedInvestmentRoundDto,
    })
    @ApiBearerAuth()
    createInvestmentRound(
        @Request() req,
        @Body() createInvestmentRoundDto: CreateInvestmentRoundDto,
        @I18nLang() lang: string,
    ): Promise<CreatedInvestmentRoundDto> {
        return this.investmentRoundService.createInvestmentRound(req.user, createInvestmentRoundDto, lang);
    }

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get investment rounds list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved investment rounds list successfully",
        type: InvestmentRoundsListDto,
    })
    @ApiBearerAuth()
    getInvestmentRound(@Request() req, @I18nLang() lang: string,): Promise<InvestmentRoundsListDto> {
        return this.investmentRoundService.getInvestmentRounds(req.user, lang);
    }

    @Get(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get investment round by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved investment round by id successfully",
        type: CreatedInvestmentRoundDto,
    })
    @ApiBearerAuth()
    getInvestmentRoundById(
        @Param("id", ParseIntPipe) investmentRoundId: number,
        @I18nLang() lang: string,
    ): Promise<CreatedInvestmentRoundDto> {
        return this.investmentRoundService.getInvestmentRoundById(investmentRoundId, lang);
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update investment round" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated investment round successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateInvestmentRound(
        @Request() req,
        @Param("id", ParseIntPipe) investmentRoundId: number,
        @Body() updateInvestmentRoundDto: UpdateInvestmentRoundDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.investmentRoundService.updateInvestmentRound(
            req.user,
            investmentRoundId,
            updateInvestmentRoundDto,
            lang,
        );
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete investment round" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted investment round successfully",
        type: BasicOperationsResponse,
    })
    deleteInvestmentRound(
        @Request() req,
        @Param("id", ParseIntPipe) investmentRoundId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.investmentRoundService.deleteInvestmentRound(req.user, investmentRoundId, lang);
    }
}
