import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class RevenueModelDto extends AbstractDto {
    @ApiProperty({ default: 1 })
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    description: string;

    @ApiProperty()
    @Expose()
    @IsString()
    businessModel: string;
}
