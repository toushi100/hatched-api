import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { CompanyModule } from "../company/company.module";
import { QueueEventService } from "./queue-event.service";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";
import { FinancialModule } from "../financial/financial.module";
import { ProfitLossModule } from "../profit_and_loss/profit-loss.module";
import { RevenueModelModule } from "../revenue-model/revenue-model.module";
import { DepartmentModule } from "../department/department.module";
import { EmployeeModule } from "../employee/employee.module";

@Module({
    imports: [
        SharedModule,
        forwardRef(() => CompanyModule),
        forwardRef(() => BudgetItemModule),
        forwardRef(() => FinancialModule),
        forwardRef(() => ProfitLossModule),
        forwardRef(() => RevenueModelModule),
        forwardRef(() => DepartmentModule),
        forwardRef(() => EmployeeModule),
        ConfigModule,
    ],
    controllers: [],
    providers: [QueueEventService],
    exports: [QueueEventService],
})
export class QueueEventModule { }
