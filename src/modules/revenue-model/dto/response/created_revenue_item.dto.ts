import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, IsObject, IsString } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { RevenueModelDto } from "./revenue_model.dto";
import { MinimalCompanyDto } from "../../../company/dto/response/minimal_company.dto";

export class CreatedRevenueItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    revenueItemId: number;

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
    @IsNumber()
    initialPrice: number;

    @ApiProperty({ type: () => RevenueModelDto })
    @Expose()
    @IsObject()
    revenueModel: RevenueModelDto;

    @ApiProperty({ type: () => MinimalCompanyDto })
    @Expose()
    @IsObject()
    company: MinimalCompanyDto;
}
