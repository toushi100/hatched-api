import * as bcrypt from "bcrypt";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { AuthKeys } from "./translate.enum";
import { UserService } from "../user/user.service";
import { ConfigService } from "../../../configs";
import { EmailVerificationCodeRepository } from "./repositories/email-verification-code.repository";
import { UserLoginDto } from "./dto/request/user-login.dto";
import { UserLoginResponseDto } from "./dto/response/user-login-response.dto";
import { TokenPayloadDto } from "./dto/response/token-payload.dto";
import { JwtService } from "@nestjs/jwt";
import { UserRoleEntity } from "../user/entities/role.entity";
import { UserRegisterDto } from "./dto/request/user-register.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { HelperService } from "../../../shared/services/helper";
import { EmailService, EmailTemplates } from "../../../shared/services/email.service";
import { EmailVerificationDto } from "./dto/request/email-verification.dto";
import { CodeVerificationDto } from "./dto/request/code-verification.dto";
import { UserEntity } from "../user/entities/user.entity";
import { RefreshTokenDto } from "./dto/request/refresh-token.dto";
import { EmailResetPasswordDto } from "./dto/request/email-reset-password.dto";
import { EmailResetPasswordCodeRepository } from "./repositories/email-reset-password-code.repository";
import { EmailResetPasswordVerificationCodeDto } from "./dto/request/email-reset-password-verification-code.dto";
import { ResetPasswordDto } from "./dto/request/reset-password.dto";
import { languagesCodes } from "../../../constants/languages";
import { UserRole } from "../user/user-role.enum";

@Injectable()
export class AuthService {
    constructor(
        public readonly jwtService: JwtService,
        public readonly userService: UserService,
        public readonly configService: ConfigService,
        public readonly helperService: HelperService,
        private readonly i18n: I18nService,
        public readonly emailService: EmailService,
        public readonly emailVerificationCodeRepository: EmailVerificationCodeRepository,
        public readonly emailResetPasswordCodeRepository: EmailResetPasswordCodeRepository,
    ) { }

    async login(userLoginDto: UserLoginDto, roleHeader: UserRole, language: string): Promise<UserLoginResponseDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.findUserByEmail(userLoginDto.email, true);

        if (!user || !(await bcrypt.compare(userLoginDto.password, user.password))) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(!user ? AuthKeys.USER_NOT_FOUND : AuthKeys.WRONG_PASSWORD, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // if (roleHeader) {
        //     if (Object.values(UserRole).includes(roleHeader)) {
        //         const { roles } = user;
        //         if (!roles || !roles.map((role) => role.name).includes(roleHeader)) {
        //             throw new HttpException(
        //                 {
        //                     isSuccessful: false,
        //                     message: await this.i18n.translate(AuthKeys.ROLE_NOT_FOUND, {
        //                         lang: languageCode,
        //                     }),
        //                 },
        //                 HttpStatus.NOT_FOUND,
        //             );
        //         }
        //     } else {
        //         throw new HttpException(
        //             {
        //                 message: `X-Role header value must be one of [${Object.values(UserRole)}]`,
        //             },
        //             HttpStatus.BAD_REQUEST,
        //         );
        //     }
        // }

        return this.generateSignInLoginTokens(user);
    }

    async register(userRegisterDto: UserRegisterDto, language: string): Promise<UserLoginResponseDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userExists = await this.userService.findUserByEmail(userRegisterDto.email);

        if (userExists) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AuthKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // generate verification code
        // const code = this.helperService.getCustomLengthRandomNumber(5);
        // const emailCodeEntry = await this.emailVerificationCodeRepository.findOne({
        //     email: userRegisterDto.email,
        // });

        // save user info and verification code
        // await this.emailVerificationCodeRepository.save({
        //     id: emailCodeEntry ? emailCodeEntry.id : undefined,
        //     email: userRegisterDto.email,
        //     firstName: userRegisterDto.firstName,
        //     lastName: userRegisterDto.lastName,
        //     password: await bcrypt.hash(userRegisterDto.password, 10),
        //     verificationCode: code,
        //     companyName: userRegisterDto.companyName,
        //     accountType: userRegisterDto.accountType,
        // });

        // send email verification code
        // await this.emailService.sendEmailThroughSMTP(
        //     userRegisterDto.email,
        //     this.configService.ENV_CONFIG.SMTP_SERVER_SENDER_EMAIL,
        //     EmailTemplates.EMAIL_VERIFICATION_CODE_SUBJECT,
        //     EmailTemplates.EMAIL_VERIFICATION_CODE_TEMPLATE,
        //     {
        //         name: userRegisterDto.firstName,
        //         code,
        //     },
        // );
        const hashedPassword = await bcrypt.hash(userRegisterDto.password, 10);
        // create new user
        const newUser = await this.userService.createUser(
            {
                firstName: userRegisterDto.firstName,
                lastName: userRegisterDto.lastName,
                email: userRegisterDto.email,
                password: hashedPassword,
                accountType: userRegisterDto.accountType,
                companyName: userRegisterDto.companyName,
                acceleratorName: userRegisterDto.acceleratorName,
            },
            language,
        );

        return this.generateSignInLoginTokens(newUser);

        // return {
        //     isSuccessful: true,
        //     message: await this.i18n.translate(AuthKeys.EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY, {
        //         lang: languageCode,
        //     }),
        // };
    }

    // async sendEmailVerificationCode(
    //     emailVerificationDto: EmailVerificationDto,
    //     language: string,
    // ): Promise<BasicOperationsResponse> {
    //     const languageCode: string = languagesCodes[language] || languagesCodes.Default;
    //     const userExists = await this.userService.findUserByEmail(emailVerificationDto.email);

    //     if (userExists) {
    //         throw new HttpException(
    //             {
    //                 isSuccessful: false,
    //                 message: await this.i18n.translate(AuthKeys.EMAIL_EXISTS, {
    //                     lang: languageCode,
    //                 }),
    //             },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     const emailVerificationCodeEntry = await this.emailVerificationCodeRepository.findOne({
    //         email: emailVerificationDto.email,
    //     });

    //     if (!emailVerificationCodeEntry) {
    //         throw new HttpException(
    //             {
    //                 isSuccessful: false,
    //                 message: await this.i18n.translate(AuthKeys.EMAIL_NOT_EXISTS, {
    //                     lang: languageCode,
    //                 }),
    //             },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     // generate verification code
    //     const code = this.helperService.getCustomLengthRandomNumber(5);

    //     // save verification code
    //     await this.emailVerificationCodeRepository.save({
    //         id: emailVerificationCodeEntry ? emailVerificationCodeEntry.id : undefined,
    //         verificationCode: code,
    //     });

    //     // send email verification code
    //     await this.emailService.sendEmailThroughSMTP(
    //         emailVerificationCodeEntry.email,
    //         this.configService.ENV_CONFIG.SMTP_SERVER_SENDER_EMAIL,
    //         EmailTemplates.EMAIL_VERIFICATION_CODE_SUBJECT,
    //         EmailTemplates.EMAIL_VERIFICATION_CODE_TEMPLATE,
    //         {
    //             name: emailVerificationCodeEntry.firstName,
    //             code,
    //         },
    //     );

    //     return {
    //         isSuccessful: true,
    //         message: await this.i18n.translate(AuthKeys.EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY, {
    //             lang: languageCode,
    //         }),
    //     };
    // }

    // async verifyEmailVerificationCode(
    //     codeVerificationDto: CodeVerificationDto,
    //     language: string,
    // ): Promise<UserLoginResponseDto> {
    //     const languageCode: string = languagesCodes[language] || languagesCodes.Default;
    //     const userExists = await this.userService.findUserByEmail(codeVerificationDto.email);

    //     if (userExists) {
    //         throw new HttpException(
    //             {
    //                 isSuccessful: false,
    //                 message: await this.i18n.translate(AuthKeys.EMAIL_EXISTS, {
    //                     lang: languageCode,
    //                 }),
    //             },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     const emailVerificationCodeEntry = await this.emailVerificationCodeRepository.findOne({
    //         email: codeVerificationDto.email,
    //     });

    //     if (!emailVerificationCodeEntry || emailVerificationCodeEntry.verificationCode !== codeVerificationDto.code) {
    //         throw new HttpException(
    //             {
    //                 isSuccessful: false,
    //                 message: await this.i18n.translate(
    //                     !emailVerificationCodeEntry ? AuthKeys.EMAIL_NOT_EXISTS : AuthKeys.VERIFICATION_CODE_NOT_VALID,
    //                     {
    //                         lang: languageCode,
    //                     },
    //                 ),
    //             },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     const expirationCodeTime =
    //         emailVerificationCodeEntry.updatedAt.getTime() +
    //         this.configService.ENV_CONFIG.EMAIL_VERIFICATION_CODE_EXPIRATION_IN_MINUTE * 60000;

    //     // UTC milliseconds
    //     const currentTimeInUTC = new Date(Date.now() + new Date().getTimezoneOffset() * 60000).getTime();

    //     if (expirationCodeTime < currentTimeInUTC) {
    //         throw new HttpException(
    //             {
    //                 isSuccessful: false,
    //                 message: await this.i18n.translate(AuthKeys.VERIFICATION_CODE_EXPIRED, {
    //                     lang: languageCode,
    //                 }),
    //             },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     // delete verification code
    //     await this.emailVerificationCodeRepository.delete(emailVerificationCodeEntry.id);

    //     // create new user
    //     const newUser = await this.userService.createUser(
    //         {
    //             firstName: emailVerificationCodeEntry.firstName,
    //             lastName: emailVerificationCodeEntry.lastName,
    //             email: emailVerificationCodeEntry.email,
    //             password: emailVerificationCodeEntry.password,
    //             accountType: emailVerificationCodeEntry.accountType,
    //             companyName: emailVerificationCodeEntry.companyName,
    //         },
    //         true,
    //     );

    //     return this.generateSignInLoginTokens(newUser);
    // }

    async sendEmailResetPasswordCode(
        emailResetPasswordDto: EmailResetPasswordDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.findUserByEmail(emailResetPasswordDto.email);

        if (!user) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.EMAIL_NOT_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const emailResetPasswordCodeEntry = await this.emailResetPasswordCodeRepository.findOne({
            email: emailResetPasswordDto.email,
        });

        // generate verification code
        const code = this.helperService.getCustomLengthRandomNumber(5);

        // save verification code
        await this.emailResetPasswordCodeRepository.save({
            id: emailResetPasswordCodeEntry ? emailResetPasswordCodeEntry.id : undefined,
            email: emailResetPasswordDto.email,
            verificationCode: code,
        });

        // send email reset password code
        await this.emailService.sendEmailThroughSMTP(
            emailResetPasswordDto.email,
            this.configService.ENV_CONFIG.SMTP_SERVER_SENDER_EMAIL,
            EmailTemplates.EMAIL_RESET_PASSWORD_CODE_SUBJECT,
            EmailTemplates.EMAIL_RESET_PASSWORD_CODE_TEMPLATE,
            {
                name: `${user.firstName} ${user.lastName}`,
                code,
            },
        );

        return {
            isSuccessful: true,
            message: await this.i18n.translate(AuthKeys.EMAIL_RESET_PASSWORD_CODE_SENT_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async verifyEmailResetPasswordCode(
        emailResetPasswordVerificationCodeDto: EmailResetPasswordVerificationCodeDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.findUserByEmail(emailResetPasswordVerificationCodeDto.email);

        if (!user) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.EMAIL_NOT_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const emailResetPasswordCodeEntry = await this.emailResetPasswordCodeRepository.findOne({
            email: emailResetPasswordVerificationCodeDto.email,
        });

        if (
            !emailResetPasswordCodeEntry ||
            emailResetPasswordCodeEntry.verificationCode !== emailResetPasswordVerificationCodeDto.code
        ) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(
                        !emailResetPasswordCodeEntry ? AuthKeys.EMAIL_NOT_EXISTS : AuthKeys.VERIFICATION_CODE_NOT_VALID,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const expirationCodeTime =
            emailResetPasswordCodeEntry.updatedAt.getTime() +
            this.configService.ENV_CONFIG.REST_PASSWORD_CODE_EXPIRATION_IN_MINUTE * 60000;

        // UTC milliseconds
        const currentTimeInUTC = new Date(Date.now() + new Date().getTimezoneOffset() * 60000).getTime();

        if (expirationCodeTime < currentTimeInUTC) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.VERIFICATION_CODE_EXPIRED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(AuthKeys.RESET_PASSWORD_CODE_VERIFIED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto, language: string): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const verified = await this.verifyEmailResetPasswordCode(resetPasswordDto, language);

        if (!verified || verified.isSuccessful !== true) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: verified.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const user = await this.userService.findUserByEmail(resetPasswordDto.email);
        const emailResetPasswordCodeEntry = await this.emailResetPasswordCodeRepository.findOne({
            email: resetPasswordDto.email,
        });

        // delete verification code
        await this.emailResetPasswordCodeRepository.delete(emailResetPasswordCodeEntry.id);

        // update user password
        await this.userService.updatedUserPassword(user.id, resetPasswordDto.password);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(AuthKeys.RESET_PASSWORD_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto, language: string): Promise<TokenPayloadDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.findUserById(refreshTokenDto.userId);
        if (!user) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (user.refreshToken !== refreshTokenDto.refreshToken) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.INVALID_REFRESH_TOKEN, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        try {
            const isTokenValid = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET_KEY,
            });
            if (!isTokenValid) {
                throw new HttpException(
                    {
                        isSuccessful: false,
                        message: await this.i18n.translate(AuthKeys.INVALID_REFRESH_TOKEN, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }
        } catch (err) {
            console.error("Error:  ", err);
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(AuthKeys.INVALID_REFRESH_TOKEN, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const tokens = this.generateTokens(user.id, user.roles);

        await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    private async generateSignInLoginTokens(user: UserEntity): Promise<UserLoginResponseDto> {
        const token = this.generateTokens(user.id, user.roles);
        await this.userService.updateRefreshToken(user.id, token.refreshToken);
        return {
            token,
            userId: user.id,
            accountType: user.accountType,
            isSuccessful: true,
        };
    }

    private generateTokens(id: number, userRoles: UserRoleEntity[]): TokenPayloadDto {
        const accessTokenExpiration = this.configService.ENV_CONFIG.JWT_ACCESS_TOKEN_EXPIRES_IN;
        const refreshTokenExpiration = this.configService.ENV_CONFIG.JWT_REFRESH_TOKEN_EXPIRES_IN;
        const roles = userRoles && userRoles.map((role) => role.name);

        const accessToken = this.jwtService.sign(
            { id, roles },
            {
                expiresIn: accessTokenExpiration,
                secret: this.configService.ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET_KEY,
            },
        );

        const refreshToken = this.jwtService.sign(
            { id },
            {
                expiresIn: refreshTokenExpiration,
                secret: this.configService.ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET_KEY,
            },
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: accessTokenExpiration,
        };
    }
}
