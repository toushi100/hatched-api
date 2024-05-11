import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { FinancialModule } from "../financial/financial.module";
import { CompanyModule } from "../company/company.module";
import { BudgetModule } from "../budget/budget.module";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";
import { ValuationModule } from "../valuation/valuation.module";
import { InvestorController } from "./investor.controller";
import { InvestorService } from "./investor.service";
import { UserModule } from "../core/user/user.module";
import { CaptableModule } from "../captable/captable.module";
import { ProfitLossModule } from "../profit_and_loss/profit-loss.module";

@Module({
    imports: [
        SharedModule,
        ConfigModule,
        FinancialModule,
        CompanyModule,
        BudgetItemModule,
        BudgetModule,
        ValuationModule,
        forwardRef(() => UserModule),
        CaptableModule,
        forwardRef(() => ProfitLossModule),
    ],
    controllers: [InvestorController],
    providers: [InvestorService],
    exports: [InvestorService],
})
export class InvestorModule { }
