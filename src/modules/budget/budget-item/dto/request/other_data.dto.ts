import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, Min, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class BudgetOtherItemsDto {
    @ApiProperty({
        description: "The amount.",
        minimum: 0,
    })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;

    @ApiProperty({
        description: "The expected monthly growth.",
        minimum: 0,
    })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    expectedMonthlyGrowth: number;

    @ApiPropertyOptional({ type: "boolean", default: false })
    @Expose()
    @IsBoolean()
    @IsOptional()
    applyOnlyMonth?: boolean;
}
