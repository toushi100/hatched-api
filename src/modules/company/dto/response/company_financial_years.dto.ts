import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class CompanyFinancialYearsDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    numberOfYears: number;
}
