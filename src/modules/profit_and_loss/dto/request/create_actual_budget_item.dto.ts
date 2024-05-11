import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { BudgetCategory } from "../../../../modules/budget/budget-category/types/budget_category.enum";

export class CreateActualBudgetItemDto extends AbstractDto {
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
}
