import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, IsObject, Min } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { MinimalCompanyDto } from "src/modules/company/dto/response/minimal_company.dto";

export class ESOPSharesDataDto extends AbstractDto {
    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    allocatedToAllPlans: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    currentlyAllocatedUnderPlans: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    notAllocated: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    vested: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    allocatedButNotVested: number;

    @ApiProperty({ minimum: 0 })
    @Expose()
    @IsNumber()
    @Min(0, { message: "Can not be negative" })
    unallocatedAndNotVested: number;

    @ApiProperty({ type: () => MinimalCompanyDto })
    @Expose()
    @IsObject()
    company: MinimalCompanyDto;
}
