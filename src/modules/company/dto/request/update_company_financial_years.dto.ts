import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber } from "class-validator";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateFinancialYearsDto extends AbstractDto {
    @ApiProperty({ default: 3 })
    @Expose()
    @IsNumber()
    @IsIn([3, 5])
    numberOfYears: number;
}
