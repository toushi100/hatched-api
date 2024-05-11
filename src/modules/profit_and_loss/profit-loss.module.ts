import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { CompanyModule } from "../company/company.module";
import { RevenueModelModule } from "../revenue-model/revenue-model.module";
import { QueueEventModule } from "../queueEvent/queue-event.module";
import { ActualBudgetItemRepository } from "./repositories/actual-budget-item.repository";
import { ActualBudgetMonthRatioRepository } from "./repositories/actual-budget-month-ratio.repository";
import { ActualBudgetMonthRepository } from "./repositories/actual-budget-month.repository";
import { BudgetCategoryModule } from "../budget/budget-category/budget-category.module";
import { ProfitLossController } from "./profit-loss.controller";
import { ProfitLossService } from "./services/profit-loss.service";
import { ProfitLossSharedService } from "./services/profit-loss-shared.service";
import { ActualBudgetItemsListMapper } from "./mapper/actual_budget_items_list.mapper";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([
            ActualBudgetItemRepository,
            ActualBudgetMonthRatioRepository,
            ActualBudgetMonthRepository,
        ]),
        RevenueModelModule,
        forwardRef(() => CompanyModule),
        ConfigModule,
        BudgetCategoryModule,
        forwardRef(() => QueueEventModule),
        forwardRef(() => BudgetItemModule),
    ],
    controllers: [ProfitLossController],
    providers: [
        ProfitLossService,
        ProfitLossSharedService,
        ActualBudgetItemsListMapper,
    ],
    exports: [
        ProfitLossService,
        ProfitLossSharedService,
        TypeOrmModule,
    ],
})
export class ProfitLossModule { }
