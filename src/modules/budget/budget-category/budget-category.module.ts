import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BudgetCategoryRepository } from "./repositories/budget-category.repository";
import { BudgetCategoryService } from "./budget-category.service";
import { CreatedBudgetCategoryMapper } from "./mapper/created_budget_category.mapper";
import { BudgetCategoryController } from "./budget-category.controller";

@Module({
    imports: [TypeOrmModule.forFeature([BudgetCategoryRepository])],
    controllers: [BudgetCategoryController],
    providers: [BudgetCategoryService, CreatedBudgetCategoryMapper],
    exports: [BudgetCategoryService],
})
export class BudgetCategoryModule {}
