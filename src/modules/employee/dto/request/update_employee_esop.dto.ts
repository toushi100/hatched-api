import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, Min } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateEmployeeESOPDto extends AbstractDto {
    @ApiProperty({ minimum: 1 })
    @Expose()
    @IsNumber()
    @Min(1, { message: "Invalid ESOP ID" })
    esopId: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    sharesAllocated: number;
}
