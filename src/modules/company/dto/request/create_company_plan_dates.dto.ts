import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { IsDateString } from "class-validator";

export class CreateCompanyPlanDatesDto extends AbstractDto {
    @ApiProperty({ default: "2023-10-01" })
    @Expose()
    @IsDateString()
    budgetStartDate: string;

    @ApiProperty({ default: "2024-09-01" })
    @Expose()
    @IsDateString()
    budgetEndDate: string;
}
