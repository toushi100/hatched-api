import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { RevenueModelController } from "./controllers/revenue-model.controller";
import { RevenueModelService } from "./revenue-model.service";
import { RevenueModelRepository } from "./repositories/revenue-model.repository";
import { CreatedRevenueItemMapper } from "./mapper/created_revenue_item.mapper";
import { RevenueModelOptionsListItemMapper } from "./mapper/revenue_models_options_list.mapper";
import { RevenueItemRepository } from "./repositories/revenue-item.repository";
import { RevenueItemController } from "./controllers/revenue-item.controller";
import { CompanyModule } from "../company/company.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([RevenueModelRepository, RevenueItemRepository]),
        SharedModule,
        forwardRef(() => CompanyModule),
        ConfigModule,
    ],
    controllers: [RevenueModelController, RevenueItemController],
    providers: [
        RevenueModelService,
        CreatedRevenueItemMapper,
        RevenueModelOptionsListItemMapper,
    ],
    exports: [RevenueModelService],
})
export class RevenueModelModule { }
