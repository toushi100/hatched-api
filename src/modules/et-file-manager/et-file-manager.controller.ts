import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUploadUrRequestDto } from "./dto/create-upload-url-request.dto";
import { CreateUploadUrlResponseDto } from "./dto/create-upload-url-response.dto";
import { EtFileManagerService } from "./et-file-manager.service";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { AccountTypeGuard } from "src/guards/account-types.guard";
import { LanguageInterceptor } from "src/interceptors/language.interceptor";
import { I18nLang } from "nestjs-i18n";

@Controller("et-file-manager")
@ApiTags("et-file-manager")
@UseInterceptors(LanguageInterceptor)
export class EtFileManagerController {
    constructor(private readonly etFilManagerService: EtFileManagerService) {
    }

    @Get("upload-url")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get upload url for images" })
    @ApiResponse({
        description: "Create upload url",
        type: CreateUploadUrlResponseDto
    })
    @ApiBearerAuth()
    createUploadUrl(
        @Req() req,
        @Query(ValidationPipe) createUploadUrlReq: CreateUploadUrRequestDto,
        @I18nLang() lang: string,
    ): Promise<CreateUploadUrlResponseDto> {
        return this.etFilManagerService.createUploadUrl(
            createUploadUrlReq,
            req.user,
            lang,
        );
    }
}
