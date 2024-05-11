import { Module, forwardRef } from '@nestjs/common';
import { AwsModule } from 'nestjs-aws';

import { EtFileManagerController } from './et-file-manager.controller';
import { EtFileManagerService } from './et-file-manager.service';
import { ConfigModule, ConfigService } from "../../configs";
import { SharedModule } from "../../shared/shared.module";
import { CompanyModule } from '../company/company.module';

@Module({
    imports: [
        ConfigModule,
        SharedModule,
        AwsModule.forRootS3Async({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                accessKeyId: configService.awsConfig.AWS_ACCESS_KEY_ID,
                secretAccessKey: configService.awsConfig.AWS_SECRET_ACCESS_KEY,
                region: configService.awsConfig.AWS_REGION,
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => CompanyModule),
    ],
    controllers: [EtFileManagerController],
    providers: [EtFileManagerService],
})
export class EtFileManagerModule { }
