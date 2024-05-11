import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { SharedModule } from "../../../shared/shared.module";
import { UserModule } from "../user/user.module";
import { EmailVerificationCodeRepository } from "./repositories/email-verification-code.repository";
import { EmailResetPasswordCodeRepository } from "./repositories/email-reset-password-code.repository";
import { ConfigModule, ConfigService } from "../../../configs";

@Module({
    imports: [
        SharedModule,
        UserModule,
        PassportModule,
        JwtModule.registerAsync(
            {
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => {
                    return ({
                        secret: configService.ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET_KEY,
                        signOptions: { expiresIn: configService.ENV_CONFIG.JWT_ACCESS_TOKEN_EXPIRES_IN }
                    });
                },
                inject: [ConfigService]
            }
        ),
        TypeOrmModule.forFeature([EmailVerificationCodeRepository, EmailResetPasswordCodeRepository])
    ],
    controllers: [AuthController],
    exports: [AuthService, PassportModule],
    providers: [AuthService, JwtStrategy]
})
export class AuthModule {
}
