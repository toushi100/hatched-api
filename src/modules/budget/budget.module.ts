import { Module } from "@nestjs/common";
import { BudgetItemModule } from "./budget-item/budget-item.module";
import { BudgetCategoryModule } from "./budget-category/budget-category.module";

@Module({
    imports: [BudgetItemModule, BudgetCategoryModule],
})
export class BudgetModule {}
