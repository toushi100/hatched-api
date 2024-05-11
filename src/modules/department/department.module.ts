import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { DepartmentController } from "./department.controller";
import { DepartmentService } from "./department.service";
import { DepartmentRepository } from "./repositories/department.repository";
import { CreatedDepartmentMapper } from "./mapper/created_department.mapper";
import { CompanyModule } from "../company/company.module";
import { FinancialItemEntity } from "../financial/entities/financial-item.entity";
import { FinancialModule } from "../financial/financial.module";
import { BudgetItemRepository } from "../budget/budget-item/repositories/budget-item.repository";
import { BudgetItemModule } from "../budget/budget-item/budget-item.module";
import { QueueEventModule } from "../queueEvent/queue-event.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([DepartmentRepository, FinancialItemEntity, BudgetItemRepository]),
        forwardRef(() => CompanyModule),
        ConfigModule,
        forwardRef(() => FinancialModule),
        forwardRef(() => BudgetItemModule),
        forwardRef(() => QueueEventModule),
    ],
    controllers: [DepartmentController],
    providers: [DepartmentService, CreatedDepartmentMapper],
    exports: [DepartmentService],
})
export class DepartmentModule { }
