import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";

export class CreatedBudgetItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    budgetItemId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty({ description: "The ID of the budget category for the budget item." })
    @Expose()
    budgetCategoryId: number;

    @ApiProperty({ enum: BudgetCategory, description: "The type of the budget category." })
    @Expose()
    budgetCategoryType: BudgetCategory;
}
