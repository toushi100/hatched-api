import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { BudgetCategory } from "../../../budget-category/types/budget_category.enum";
import { BudgetDirectCostsItemDto } from "./direct_cost_data.dto";
import { BudgetRevenueItemDto } from "./revenue_data.dto";
import { BudgetOtherItemsDto } from "./other_data.dto";

export class CreateBudgetItemDto extends AbstractDto {
    @ApiProperty({
        minLength: 1,
        maxLength: 200,
        description: "The name of the budget item.",
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional({
        description: "The description of the budget item.",
    })
    @Expose()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        minimum: 1,
        description: "The ID of the budget category for the budget item.",
    })
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
            { $ref: getSchemaPath(BudgetDirectCostsItemDto) },
            { $ref: getSchemaPath(BudgetRevenueItemDto) },
            { $ref: getSchemaPath(BudgetOtherItemsDto) },
        ],
        description: "The data associated with the budget item.",
    })
    @ValidateNested()
    @Type((obj: any) => {
        if (obj.newObject.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
            return BudgetDirectCostsItemDto;
        }
        if (obj.newObject.budgetCategoryType === BudgetCategory.REVENUE) {
            return BudgetRevenueItemDto;
        }
        return BudgetOtherItemsDto;
    })
    data: BudgetDirectCostsItemDto | BudgetRevenueItemDto | BudgetOtherItemsDto;
}
