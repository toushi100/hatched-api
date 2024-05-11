import { ApiProperty } from "@nestjs/swagger";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { BudgetCategory } from "../../types/budget_category.enum";
import { Expose } from "class-transformer";

export class CreatedBudgetCategoryDto extends AbstractDto {
    @ApiProperty({ default: 1 })
    @Expose()
    budgetCategoryId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({ type: "enum", enum: BudgetCategory })
    @Expose()
    type: BudgetCategory;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty()
    @Expose()
    displayOrder: number;
}
