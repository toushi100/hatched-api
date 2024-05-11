import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, IsObject, IsString, Max } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { MinimalCompanyDto } from "src/modules/company/dto/response/minimal_company.dto";

export class ESOPDto extends AbstractDto {
    @ApiProperty({ default: 1 })
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty({ default: 5, maximum: 5 })
    @Expose()
    @IsNumber()
    @Max(5)
    numberOfYears: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    year1: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    year2: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    year3: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    year4: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    year5: number;

    @ApiProperty({ type: () => MinimalCompanyDto })
    @Expose()
    @IsObject()
    company: MinimalCompanyDto;
}
