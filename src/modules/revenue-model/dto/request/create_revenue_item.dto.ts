import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class CreateRevenueItemDto extends AbstractDto {
    @ApiProperty({ type: () => [RevenueItemDataDto] })
    @Expose()
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => RevenueItemDataDto)
    items: RevenueItemDataDto[];
}

export class RevenueItemDataDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @Expose()
    @IsNumber()
    initialPrice: number;

    @ApiProperty({ minimum: 1 })
    @Expose()
    @IsNumber()
    @Min(1, { message: "Invalid revenue model ID" })
    revenueModelId: number;
}
