import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateActualBudgetMonthItemDto extends AbstractDto {
    @ApiProperty({ description: "The new actual value." })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: "Invalid value" })
    value: number;
}
