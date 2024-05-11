import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, Min, IsNumber, IsBoolean, ValidateNested, IsOptional } from "class-validator";
import { IsValidBudgetRevenueItemCurrentValue } from "src/decorators/budget-validators.decorator";

export class BudgetRevenueCurrentValueCalculation {
    @ApiProperty({ description: "The revenue source ID.", minimum: 1 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: "revenueSourceId Invalid revenue source ID" })
    revenueSourceId: number;

    @ApiProperty({ description: "The quantity.", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: "quantity cannot be negative" })
    quantity: number;

    @ApiProperty({ description: "The price.", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: "price cannot be negative" })
    price: number;
}

export class BudgetRevenueFutureGrowth {
    @ApiProperty({ description: "The expected monthly growth.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "expectedMonthlyGrowth cannot be negative" })
    @IsNotEmpty()
    expectedMonthlyGrowth: number;

    @ApiProperty({ description: "The churn rate for month 1.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "month1ChurnRate cannot be negative" })
    @IsNotEmpty()
    month1ChurnRate: number;

    @ApiProperty({ description: "The churn rate for month 2.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "month2ChurnRate cannot be negative" })
    @IsNotEmpty()
    month2ChurnRate: number;

    @ApiProperty({ description: "The churn rate for month 3.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "month3ChurnRate cannot be negative" })
    @IsNotEmpty()
    month3ChurnRate: number;

    @ApiProperty({ description: "The churn rate for months 4 to 12.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "months4To12ChurnRate cannot be negative" })
    @IsNotEmpty()
    months4To12ChurnRate: number;
}

// Class for manual current value input
export class BudgetRevenueManualCurrentValue {
    @ApiProperty({ type: "number", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;
}

// Class for manual future growth input
export class BudgetRevenueManualFutureGrowth {
    @ApiProperty({ description: "The expected monthly growth.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "expectedMonthlyGrowth cannot be negative" })
    @IsNotEmpty()
    expectedMonthlyGrowth: number;
}

export class BudgetRevenueItemDto {
    @ApiProperty({ description: "Indicates if the input is manual." })
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    isManualInput: boolean;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(BudgetRevenueCurrentValueCalculation) },
            { $ref: getSchemaPath(BudgetRevenueManualCurrentValue) },
        ],
        description: "The current value calculation.",
    })
    @Expose()
    @IsValidBudgetRevenueItemCurrentValue()
    currentValue: BudgetRevenueCurrentValueCalculation[] | BudgetRevenueManualCurrentValue;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(BudgetRevenueFutureGrowth) },
            { $ref: getSchemaPath(BudgetRevenueManualFutureGrowth) },
        ],
        description: "The future growth information.",
    })
    @Expose()
    @IsNotEmpty()
    @ValidateNested()
    @Type((obj: any) => (obj.newObject.isManualInput ? BudgetRevenueManualFutureGrowth : BudgetRevenueFutureGrowth))
    futureGrowth: BudgetRevenueFutureGrowth | BudgetRevenueManualFutureGrowth;

    @ApiPropertyOptional({ type: "boolean", default: false })
    @Expose()
    @IsBoolean()
    @IsOptional()
    applyOnlyMonth?: boolean;
}
