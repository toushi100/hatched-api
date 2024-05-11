import { Global, HttpModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LanguageService } from "./services/language.service";
import { ConfigModule } from "../configs";
import { AppLanguageRepository } from "./repositories/app_language.repository";
import { HelperService } from "./services/helper";
import { EmailService } from "./services/email.service";

const providers = [LanguageService, HelperService, EmailService];

@Global()
@Module({
    providers,
    imports: [HttpModule, ConfigModule, TypeOrmModule.forFeature([AppLanguageRepository])],
    exports: [...providers, HttpModule],
})
export class SharedModule {}
