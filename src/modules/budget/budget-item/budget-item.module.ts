import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../../configs";
import { BudgetItemController } from "./budget-item.controller";
import { BudgetItemService } from "./services/budget-item.service";
import { BudgetItemRepository } from "./repositories/budget-item.repository";
import { CreatedBudgetItemMapper } from "./mapper/created_budget_item.mapper";
import { BudgetCategoryRepository } from "../budget-category/repositories/budget-category.repository";
import { CompanyModule } from "src/modules/company/company.module";
import { BudgetItemsListMapper } from "./mapper/budget_items_list.mapper";
import { BudgetCategoryModule } from "../budget-category/budget-category.module";
import { RevenueModelModule } from "src/modules/revenue-model/revenue-model.module";
import { BudgetItemDirectCostRepository } from "./repositories/budget-item-direct-cost.repository";
import { BudgetItemManualCostRepository } from "./repositories/budget-item-manual-cost.repository";
import { BudgetItemRevenueFutureGrowthRepository } from "./repositories/budget-item-revenue-future-growth.repository";
import { BudgetItemRevenueRepository } from "./repositories/budget-item-revenue.repository";
import { BudgetMonthRepository } from "./repositories/budget-month.repository";
import { BudgetMonthRatioRepository } from "./repositories/budget-month-ratio.repository";
import { BudgetMonthItemMapper } from "./mapper/budget_month_item.mapper";
import { BudgetSharedService } from "./services/budget-shared.service";
import { BudgetItemDirectCostService } from "./services/budget-item-direct-cost.service";
import { BudgetItemManualCostService } from "./services/budget-item-manual-cost.service";
import { BudgetItemRevenueService } from "./services/budget-item-revenue.service";
import { QueueEventModule } from "src/modules/queueEvent/queue-event.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([
            BudgetItemRepository,
            BudgetCategoryRepository,
            BudgetItemDirectCostRepository,
            BudgetItemManualCostRepository,
            BudgetItemRevenueFutureGrowthRepository,
            BudgetItemRevenueRepository,
            BudgetMonthRepository,
            BudgetMonthRatioRepository,
        ]),
        RevenueModelModule,
        forwardRef(() => CompanyModule),
        ConfigModule,
        BudgetCategoryModule,
        forwardRef(() => QueueEventModule),
    ],
    controllers: [BudgetItemController],
    providers: [
        BudgetItemService,
        BudgetItemsListMapper,
        CreatedBudgetItemMapper,
        BudgetMonthItemMapper,
        BudgetSharedService,
        BudgetItemDirectCostService,
        BudgetItemManualCostService,
        BudgetItemRevenueService,
    ],
    exports: [BudgetItemService, BudgetSharedService, TypeOrmModule],
})
export class BudgetItemModule { }
