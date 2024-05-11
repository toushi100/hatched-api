import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreatedAcceleratorMapper } from "./mapper/created-accelerator.mapper";
import { AcceleratorService } from "./accelerator.service";
import { SharedModule } from "src/shared/shared.module";
import { ConfigModule } from "src/configs";
import { AcceleratorRepository } from "./repositories/accelerator.repository";
import { CompanyModule } from "../company/company.module";
import { ValuationModule } from "../valuation/valuation.module";
import { UserModule } from "../core/user/user.module";
import { CaptableModule } from "../captable/captable.module";
import { AcceleratorController } from "./accelerator.controller";
import { AcceleratorListItemMapper } from "./mapper/accelerator_list_item.mapper";
import { ProfitLossModule } from "../profit_and_loss/profit-loss.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([AcceleratorRepository]),
        SharedModule,
        ConfigModule,
        forwardRef(() => CompanyModule),
        ValuationModule,
        forwardRef(() => UserModule),
        CaptableModule,
        forwardRef(() => ProfitLossModule),
    ],
    controllers: [AcceleratorController],
    exports: [AcceleratorService],
    providers: [CreatedAcceleratorMapper, AcceleratorService, AcceleratorListItemMapper],
})
export class AcceleratorModule { }
