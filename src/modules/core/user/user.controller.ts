import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Request,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { UserProfileDto } from "./dto/response/user-profile.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { UpdateUserProfileDto } from "./dto/request/update-user-profile.dto";
import { I18nLang } from "nestjs-i18n";
import { UserEmailDto } from "./dto/request/user-email.dto";
import { EmailVerificationCodeDto } from "./dto/request/email-verification-code.dto";

@Controller("users")
@ApiTags("User")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes
})
@UseInterceptors(LanguageInterceptor)
export class UserController {
    constructor(
        public readonly userService: UserService,
    ) {
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get user profile" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "User profile",
        type: UserProfileDto
    })
    getUserProfile(@Request() req, @I18nLang() lang: string): Promise<UserProfileDto> {
        return this.userService.getUserProfile(req.user, lang);
    }

    @Put("me")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update user profile" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "User profile",
        type: BasicOperationsResponse
    })
    updateUserProfile(
        @Request() req,
        @Body() updateUserProfileDto: UpdateUserProfileDto,
        @I18nLang() lang: string
    ): Promise<BasicOperationsResponse> {
        return this.userService.updateUserProfile(req.user, updateUserProfileDto, lang);
    }

    @Delete("me")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete user profile and data" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted user profile",
        type: BasicOperationsResponse,
    })
    deleteUser(@Request() req, @I18nLang() lang: string): Promise<BasicOperationsResponse> {
        return this.userService.deleteUser(req.user, lang);
    }

    @Post("me/email")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Send email verification code to the given email" })
    @ApiResponse({
        status: HttpStatus.OK,
        type: BasicOperationsResponse,
        description: "Successfully sent email verification code"
    })
    sendEmailVerificationCode(
        @Request() req,
        @Body() userEmailDto: UserEmailDto,
        @I18nLang() lang: string
    ): Promise<BasicOperationsResponse> {
        return this.userService.sendEmailVerificationCode(req.user, userEmailDto, lang);
    }

    @Put("me/email-verification-code")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Verify email verification code and update user's email" })
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        status: HttpStatus.OK,
        type: BasicOperationsResponse,
        description: "Successfully update user's email"
    })
    async verifyEmailVerificationCode(
        @Request() req,
        @Body() emailVerificationCodeDto: EmailVerificationCodeDto,
        @I18nLang() lang: string
    ): Promise<BasicOperationsResponse> {
        return this.userService.verifyEmailVerificationCode(req.user, emailVerificationCodeDto, lang);
    }
}
