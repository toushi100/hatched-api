import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { FinancialController } from "./financial.controller";
import { FinancialService } from "./services/financial.service";
import { FinancialItemRepository } from "./repositories/financial-item.repository";
import { CreatedFinancialItemMapper } from "./mapper/created_financial_item.mapper";
import { BudgetCategoryRepository } from "../budget/budget-category/repositories/budget-category.repository";
import { FinancialItemDirectCostRepository } from "./repositories/financial-item-direct-cost.repository";
import { FinancialItemManualCostRepository } from "./repositories/financial-item-manual-cost.repository";
import { FinancialItemRevenueFutureGrowthRepository } from "./repositories/financial-item-revenue-future-growth.repository";
import { FinancialItemRevenueRepository } from "./repositories/financial-item-revenue.repository";
import { FinancialQuarterRepository } from "./repositories/financial-quarter.repository";
import { FinancialItemRevenueService } from "./services/financial-item-revenue.service";
import { FinancialItemManualCostService } from "./services/financial-item-manual-cost.service";
import { FinancialItemDirectCostService } from "./services/financial-item-direct-cost.service";
import { FinancialSharedService } from "./services/financial-shared.service";
import { CompanyModule } from "../company/company.module";
import { RevenueModelModule } from "../revenue-model/revenue-model.module";
import { FinancialItemsListMapper } from "./mapper/financial_items_list.mapper";
import { BudgetCategoryModule } from "../budget/budget-category/budget-category.module";
import { FinancialQuarterItemMapper } from "./mapper/financial_quarter_item.mapper";
import { FinancialQuarterRatioRepository } from "./repositories/financial-quarter-ratio.repository";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([
            FinancialItemRepository,
            BudgetCategoryRepository,
            FinancialItemDirectCostRepository,
            FinancialItemManualCostRepository,
            FinancialItemRevenueFutureGrowthRepository,
            FinancialItemRevenueRepository,
            FinancialQuarterRepository,
            FinancialQuarterRatioRepository,
        ]),
        RevenueModelModule,
        forwardRef(() => CompanyModule),
        ConfigModule,
        BudgetCategoryModule,
        forwardRef(() => BudgetItemModule),
    ],
    controllers: [FinancialController],
    providers: [
        FinancialSharedService,
        FinancialService,
        FinancialItemDirectCostService,
        FinancialItemManualCostService,
        FinancialItemRevenueService,
        FinancialItemsListMapper,
        CreatedFinancialItemMapper,
        FinancialQuarterItemMapper,
    ],
    exports: [FinancialService, FinancialSharedService, TypeOrmModule],
})
export class FinancialModule { }
