import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { I18nLang } from "nestjs-i18n";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { UserLoginResponseDto } from "./dto/response/user-login-response.dto";
import { UserLoginDto } from "./dto/request/user-login.dto";
import { UserRegisterDto } from "./dto/request/user-register.dto";
import { EmailVerificationDto } from "./dto/request/email-verification.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { CodeVerificationDto } from "./dto/request/code-verification.dto";
import { TokenPayloadDto } from "./dto/response/token-payload.dto";
import { RefreshTokenDto } from "./dto/request/refresh-token.dto";
import { EmailResetPasswordDto } from "./dto/request/email-reset-password.dto";
import { EmailResetPasswordVerificationCodeDto } from "./dto/request/email-reset-password-verification-code.dto";
import { ResetPasswordDto } from "./dto/request/reset-password.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { UserRole } from "../user/user-role.enum";

@Controller("auth")
@ApiTags("auth")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class AuthController {
    constructor(public readonly authService: AuthService, public readonly userService: UserService) { }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: UserLoginResponseDto,
        description: "User info with access token",
    })
    // @ApiHeader({ name: "X-Role", enum: UserRole, description: "Will check the provided role." })
    async userLogin(
        @Body() userLoginDto: UserLoginDto,
        @Headers() headers,
        @I18nLang() lang: string,
    ): Promise<UserLoginResponseDto> {
        return this.authService.login(userLoginDto, headers["x-role"], lang);
    }

    @Post("registration")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: UserLoginResponseDto,
        description: "The user created",
    })
    async userRegister(
        @Body() userRegisterDto: UserRegisterDto,
        @I18nLang() lang: string,
    ): Promise<UserLoginResponseDto> {
        return this.authService.register(userRegisterDto, lang);
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: TokenPayloadDto,
        description: "Token payload",
    })
    public async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
        @I18nLang() lang: string,
    ): Promise<TokenPayloadDto> {
        return this.authService.refreshToken(refreshTokenDto, lang);
    }

    // @Post("email-verification")
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: "Send email verification code" })
    // @ApiOkResponse({
    //     type: BasicOperationsResponse,
    //     description: "Successfully sent email verification code",
    // })
    // async sendEmailVerificationCode(
    //     @Body() emailVerificationDto: EmailVerificationDto,
    //     @I18nLang() lang: string,
    // ): Promise<BasicOperationsResponse> {
    //     return this.authService.sendEmailVerificationCode(emailVerificationDto, lang);
    // }

    // @Post("email-verification-code")
    // @HttpCode(HttpStatus.OK)
    // @ApiOkResponse({
    //     type: UserLoginResponseDto,
    //     description: "User info with access token",
    // })
    // async verifyEmailVerificationCode(
    //     @Body() codeVerificationDto: CodeVerificationDto,
    //     @I18nLang() lang: string,
    // ): Promise<UserLoginResponseDto> {
    //     return this.authService.verifyEmailVerificationCode(codeVerificationDto, lang);
    // }

    @Post("forgot-password/email-reset-password")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Send email reset password code" })
    @ApiOkResponse({
        type: BasicOperationsResponse,
        description: "Successfully sent email reset password code",
    })
    async sendEmailResetPasswordCode(
        @Body() emailResetPasswordDto: EmailResetPasswordDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.authService.sendEmailResetPasswordCode(emailResetPasswordDto, lang);
    }

    @Post("forgot-password/email-reset-password-code")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Verify reset password code" })
    @ApiOkResponse({
        type: BasicOperationsResponse,
        description: "Successfully verified reset password code",
    })
    async verifyEmailResetPasswordCode(
        @Body() emailResetPasswordVerificationCodeDto: EmailResetPasswordVerificationCodeDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.authService.verifyEmailResetPasswordCode(emailResetPasswordVerificationCodeDto, lang);
    }

    @Post("forgot-password/reset-password")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Reset user password" })
    @ApiOkResponse({
        type: BasicOperationsResponse,
        description: "Successfully reset user password",
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.authService.resetPassword(resetPasswordDto, lang);
    }

    @UseGuards(JwtAuthGuard)
    @Get("logout")
    logout(@I18nLang() lang: string): string {
        return `user logout: ${lang}`;
    }
}
