import { CacheModule, Module } from "@nestjs/common";
import { StaticTextService } from "./static-text.service";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StaticTextRepository } from "./repositories/static-text.repository";
import { StaticTextTranslationRepository } from "./repositories/static-text-translation.repository";
import { ConfigModule } from "../../configs";
import { StaticTextsController } from "./static-text.controller";
import { StaticTextMapper } from "./static-text.mapper";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([StaticTextRepository, StaticTextTranslationRepository]),
        ConfigModule,
        CacheModule.register(),
    ],
    controllers: [StaticTextsController],
    providers: [StaticTextService, StaticTextMapper],
})
export class StaticTextModule {}
