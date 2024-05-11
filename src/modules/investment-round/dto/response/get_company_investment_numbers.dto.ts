import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class GetCompanyInvestmentNumbersDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    preMoney: number;

    @ApiProperty()
    @Expose()
    existingShares: number;

    @ApiProperty()
    @Expose()
    existingSharesLessESOP: number;
}
