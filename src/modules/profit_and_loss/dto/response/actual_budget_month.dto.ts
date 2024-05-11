import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ActualBudgetMonthDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    monthDate: Date;
}
