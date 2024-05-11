import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserRepository } from "./repositories/user.repository";
import { UserRoleEntity } from "./entities/role.entity";
import { SharedModule } from "../../../shared/shared.module";
import { ConfigModule } from "../../../configs";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserMapper } from "./mapper/user.mapper";
import { UserPayloadMapper } from "./mapper/user-payload.mapper";
import { UserProfileMapper } from "./mapper/user-profile.mapper";
import { UserEmailVerificationCodeRepository } from "./repositories/user-email-verification-code.repository";
import { CompanyModule } from "src/modules/company/company.module";
import { AcceleratorModule } from "src/modules/accelerator/accelerator.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository, UserRoleEntity, UserEmailVerificationCodeRepository]),
        SharedModule,
        ConfigModule,
        forwardRef(() => CompanyModule),
        AcceleratorModule,
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService, UserMapper, UserPayloadMapper, UserProfileMapper],
})
export class UserModule {}
