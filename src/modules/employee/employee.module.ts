import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { EmployeeController } from "./employee.controller";
import { EmployeeService } from "./employee.service";
import { EmployeeRepository } from "./repositories/employee.repository";
import { CreatedEmployeeMapper } from "./mapper/created_employee.mapper";
import { EmployeeListItemMapper } from "./mapper/employee_list_item.mapper";
import { CompanyModule } from "../company/company.module";
import { FinancialModule } from "../financial/financial.module";
import { BudgetItemRepository } from "../budget/budget-item/repositories/budget-item.repository";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";
import { QueueEventModule } from "../queueEvent/queue-event.module";
import { EmployeeOrgChartNodeMapper } from "./mapper/employee_org_chart_node.mapper";
import { ESOPModule } from "../esop/esop.module";
import { EmployeesVestingMapper } from "./mapper/employees_vesting.mapper";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([EmployeeRepository, BudgetItemRepository]),
        forwardRef(() => CompanyModule),
        ConfigModule,
        forwardRef(() => FinancialModule),
        forwardRef(() => BudgetItemModule),
        forwardRef(() => QueueEventModule),
        forwardRef(() => ESOPModule),
    ],
    controllers: [EmployeeController],
    providers: [
        EmployeeService,
        CreatedEmployeeMapper,
        EmployeeListItemMapper,
        EmployeeOrgChartNodeMapper,
        EmployeesVestingMapper,
    ],
    exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule { }
