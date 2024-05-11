import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, Min, ValidateNested } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialDirectCostsItemDto } from "./direct_cost_data.dto";
import { FinancialRevenueItemDto } from "./revenue_data.dto";
import { FinancialOtherItemsDto } from "./other_data.dto";

export class UpdateFinancialQuarterItemDto extends AbstractDto {
    @ApiProperty({ description: "The ID of the budget category for the financial item." })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: "Invalid budget category id" })
    budgetCategoryId: number;

    @ApiProperty({ enum: BudgetCategory, description: "The type of the budget category." })
    @Expose()
    @IsEnum(BudgetCategory)
    @IsNotEmpty()
    budgetCategoryType: BudgetCategory;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(FinancialDirectCostsItemDto) },
            { $ref: getSchemaPath(FinancialRevenueItemDto) },
            { $ref: getSchemaPath(FinancialOtherItemsDto) },
        ],
        description: "The data associated with the financial item.",
    })
    @ValidateNested()
    @Type((obj: any) => {
        if (obj.newObject.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
            return FinancialDirectCostsItemDto;
        }
        if (obj.newObject.budgetCategoryType === BudgetCategory.REVENUE) {
            return FinancialRevenueItemDto;
        }
        return FinancialOtherItemsDto;
    })
    data: FinancialDirectCostsItemDto | FinancialRevenueItemDto | FinancialOtherItemsDto;
}
