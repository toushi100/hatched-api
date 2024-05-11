import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class UpdateBudgetItemDto extends AbstractDto {
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
}
