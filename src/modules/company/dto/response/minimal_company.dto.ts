import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsNumber } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class MinimalCompanyDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    companyId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;
}
