import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ActualBudgetMonthItemDto extends AbstractDto {
    @ApiProperty({ description: "The actual value." })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    value: number;
}
