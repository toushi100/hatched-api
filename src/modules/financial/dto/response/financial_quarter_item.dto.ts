import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { FinancialDirectCostsItemDto } from "../request/direct_cost_data.dto";
import { FinancialRevenueItemDto } from "../request/revenue_data.dto";
import { FinancialOtherItemsDto } from "../request/other_data.dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { BusinessModel } from "src/modules/revenue-model/types/business_model.enum";

export class FinancialQuarterItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    financialItemId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty({ description: "The ID of the budget category for the financial item." })
    @Expose()
    budgetCategoryId: number;

    @ApiProperty({ enum: BudgetCategory, description: "The type of the budget category." })
    @Expose()
    budgetCategoryType: BudgetCategory;

    @ApiProperty()
    @Expose()
    financialQuarterItemId: number;

    @ApiProperty({ enum: BusinessModel, description: "The type of the business model." })
    @Expose()
    businessModel: BusinessModel;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(FinancialDirectCostsItemDto) },
            { $ref: getSchemaPath(FinancialRevenueItemDto) },
            { $ref: getSchemaPath(FinancialOtherItemsDto) },
        ],
        description: "The data associated with the financial item.",
    })
    data: FinancialDirectCostsItemDto | FinancialRevenueItemDto | FinancialOtherItemsDto;
}
