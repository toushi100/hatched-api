import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsNotEmpty, Min, IsNumber, IsBoolean, IsEnum, ValidateNested, ValidateIf, IsOptional } from "class-validator";
import { AddOrSubtract } from "../../../types/addOrSubtract.enum";

// Class for the calculation of current value
export class BudgetDirectCostsCurrentValueCalculation {
    @ApiProperty({ type: "number", minimum: 1 })
    @Expose()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    revenueItemId: number;

    @ApiProperty({ type: "number", minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    revenueItemPercentage: number;

    @ApiProperty({ enum: AddOrSubtract })
    @Expose()
    @IsEnum(AddOrSubtract)
    @IsNotEmpty()
    addOrSubtract: AddOrSubtract;

    @ApiProperty({ type: "number" })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ type: "boolean" })
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    willApplyPercentageToUpcomingMonths: boolean;
}

// Class for manual current value input
export class BudgetDirectCostsManualCurrentValue {
    @ApiProperty({ type: "number", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;
}

// Class for future growth
export class BudgetDirectCostsFutureGrowth {
    @ApiProperty({ type: "number", minimum: 0 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    expectedMonthlyGrowth: number;
}

// Main DTO class
export class BudgetDirectCostsItemDto {
    @ApiProperty({ description: "Indicates if the input is manual." })
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    isManualInput: boolean;

    @ApiProperty({
        type: () => Object,
        oneOf: [
            { $ref: getSchemaPath(BudgetDirectCostsCurrentValueCalculation) },
            { $ref: getSchemaPath(BudgetDirectCostsManualCurrentValue) },
        ],
    })
    @Expose()
    @ValidateNested()
    @Type((obj: any) =>
        obj.newObject.isManualInput ? BudgetDirectCostsManualCurrentValue : BudgetDirectCostsCurrentValueCalculation,
    )
    @IsNotEmpty()
    currentValue: BudgetDirectCostsManualCurrentValue | BudgetDirectCostsCurrentValueCalculation;

    @ApiPropertyOptional({
        type: () => BudgetDirectCostsFutureGrowth,
        description: "Required if isManualInput is true",
    })
    @Expose()
    @ValidateIf((dto: BudgetDirectCostsItemDto) => dto.isManualInput)
    @ValidateNested()
    @Transform(({ value, obj }) => {
        if (obj.isManualInput) {
            return value;
        }
        return undefined;
    })
    @IsNotEmpty()
    @Type(() => BudgetDirectCostsFutureGrowth)
    futureGrowth?: BudgetDirectCostsFutureGrowth;

    @ApiPropertyOptional({ type: "boolean", default: false })
    @Expose()
    @IsBoolean()
    @IsOptional()
    applyOnlyMonth?: boolean;
}
