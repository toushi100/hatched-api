import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { BudgetDirectCostsItemDto } from "../request/direct_cost_data.dto";
import { BudgetRevenueItemDto } from "../request/revenue_data.dto";
import { BudgetOtherItemsDto } from "../request/other_data.dto";
import { BusinessModel } from "src/modules/revenue-model/types/business_model.enum";

export class BudgetMonthItemDto extends AbstractDto {
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

    @ApiProperty()
    @Expose()
    budgetItemMonthId: number;

    @ApiProperty({ enum: BusinessModel, description: "The type of the business model." })
    @Expose()
    businessModel: BusinessModel;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(BudgetDirectCostsItemDto) },
            { $ref: getSchemaPath(BudgetRevenueItemDto) },
            { $ref: getSchemaPath(BudgetOtherItemsDto) },
        ],
        description: "The data associated with the budget item.",
    })
    data: BudgetDirectCostsItemDto | BudgetRevenueItemDto | BudgetOtherItemsDto;
}
