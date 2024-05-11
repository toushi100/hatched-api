import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateTotalSharesDto extends AbstractDto {
    @ApiProperty({ minimum: 0 })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    @Min(0, { message: "Total shares cannot be negative" })
    newTotalShares: number;
}
