import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors, Request, Post, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { SendInvitationsDto } from "../dto/request/send-invitations.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { InvitationService } from "../services/invitation.service";
import { AccountTypeGuard } from "../../../guards/account-types.guard";
import { AccountTypes } from "../../../decorators/account-types.decorator";
import { AccountType } from "../../core/user/account-type.enum";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { PendingInvitationDto } from "../dto/response/pending-invitation.dto";
import { I18nLang } from "nestjs-i18n";

@Controller("company/invitations")
@ApiTags("Company")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class InvitationController {
    constructor(public readonly invitationService: InvitationService) {}

    @Get()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get pending company invitations list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved pending company invitations list successfully",
        type: [PendingInvitationDto],
    })
    @ApiBearerAuth()
    getCompanyPendingInvitationsList(@Request() req): Promise<PendingInvitationDto[]> {
        return this.invitationService.getPendingInvitations(req.user);
    }

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Send a bulk of new invitations" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Invitations sent successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    sendNewInvitation(
        @Request() req,
        @Body() sendInvitationsDto: SendInvitationsDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.invitationService.sendNewInvitations(req.user, sendInvitationsDto, lang);
    }
}
