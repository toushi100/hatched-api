import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class CreatedCompanyPlanDatesDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    budgetStartDate: string;

    @ApiProperty()
    @Expose()
    budgetEndDate: string;

    @ApiProperty()
    @Expose()
    financialStartDate: string;

    @ApiProperty()
    @Expose()
    financialEndDate: string;
}
