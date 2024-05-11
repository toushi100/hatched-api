import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { ValuationController } from "./valuation.controller";
import { ValuationService } from "./valuation.service";
import { FinancialModule } from "../financial/financial.module";
import { CompanyModule } from "../company/company.module";
import { BudgetModule } from "../budget/budget.module";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";

@Module({
    imports: [
        SharedModule,
        ConfigModule,
        FinancialModule,
        forwardRef(() => CompanyModule),
        BudgetItemModule,
        BudgetModule,
    ],
    controllers: [ValuationController],
    providers: [ValuationService],
    exports: [ValuationService],
})
export class ValuationModule { }
