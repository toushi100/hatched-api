import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, Min, IsNumber, IsBoolean, ValidateNested, IsOptional } from "class-validator";
import { IsValidFinancialRevenueItemCurrentValue } from "src/decorators/financial-validators.decorator";

export class FinancialRevenueCurrentValueCalculation {
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

export class FinancialRevenueFutureGrowth {
    @ApiProperty({ description: "The expected quarterly growth.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "expectedQuarterlyGrowth cannot be negative" })
    @IsNotEmpty()
    expectedQuarterlyGrowth: number;

    @ApiProperty({ description: "The churn rate for quarter 1.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "quarter1Churn cannot be negative" })
    @IsNotEmpty()
    quarter1Churn: number;

    @ApiProperty({ description: "The churn rate for residual.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "residualChurn cannot be negative" })
    @IsNotEmpty()
    residualChurn: number;
}

// Class for manual current value input
export class FinancialRevenueManualCurrentValue {
    @ApiProperty({ type: "number", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;
}

// Class for manual future growth input
export class FinancialRevenueManualFutureGrowth {
    @ApiProperty({ description: "The expected monthly growth.", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "expectedQuarterlyGrowth cannot be negative" })
    @IsNotEmpty()
    expectedQuarterlyGrowth: number;
}

export class FinancialRevenueItemDto {
    @ApiProperty({ description: "Indicates if the input is manual." })
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    isManualInput: boolean;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(FinancialRevenueCurrentValueCalculation) },
            { $ref: getSchemaPath(FinancialRevenueManualCurrentValue) },
        ],
        description: "The current value calculation.",
    })
    @Expose()
    @IsValidFinancialRevenueItemCurrentValue()
    currentValue: FinancialRevenueCurrentValueCalculation[] | FinancialRevenueManualCurrentValue;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(FinancialRevenueFutureGrowth) },
            { $ref: getSchemaPath(FinancialRevenueManualFutureGrowth) },
        ],
        description: "The future growth information.",
    })
    @Expose()
    @IsNotEmpty()
    @ValidateNested()
    @Type((obj: any) =>
        obj.newObject.isManualInput ? FinancialRevenueManualFutureGrowth : FinancialRevenueFutureGrowth,
    )
    futureGrowth: FinancialRevenueManualFutureGrowth | FinancialRevenueFutureGrowth;

    @ApiPropertyOptional({ type: "boolean", default: false })
    @Expose()
    @IsBoolean()
    @IsOptional()
    applyOnlyMonth?: boolean;
}
