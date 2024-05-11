import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { BudgetCategory } from "../../../budget/budget-category/types/budget_category.enum";
import { FinancialDirectCostsItemDto } from "./direct_cost_data.dto";
import { FinancialRevenueItemDto } from "./revenue_data.dto";
import { FinancialOtherItemsDto } from "./other_data.dto";

export class CreateFinancialItemDto extends AbstractDto {
    @ApiProperty({
        minLength: 1,
        maxLength: 200,
        description: "The name of the financial item.",
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional({
        description: "The description of the financial item.",
    })
    @Expose()
    @IsString()
    @IsOptional()
    description?: string;

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
