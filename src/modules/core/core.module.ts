import { Module } from "@nestjs/common";
import { ConfigModule } from "../../configs";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        UserModule,
    ],
})
export class CoreModule {}
