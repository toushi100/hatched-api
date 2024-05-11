import { Module } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { CompanyModule } from "../company/company.module";
import { ValuationModule } from "../valuation/valuation.module";
import { CaptableModule } from "../captable/captable.module";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";
import { ProfitLossModule } from "../profit_and_loss/profit-loss.module";

@Module({
    imports: [
        SharedModule,
        CompanyModule,
        ConfigModule,
        ValuationModule,
        CaptableModule,
        BudgetItemModule,
        ProfitLossModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule {}
