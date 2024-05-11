import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateFinancialItemDto extends AbstractDto {
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
}
