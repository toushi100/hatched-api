import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class EmployeeVestingItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    employeeId: number;

    @ApiProperty()
    @Expose()
    employeeName: string;

    @ApiProperty()
    @Expose()
    employeeEmail: string;

    @ApiProperty({ type: () => Date })
    @Expose()
    startDate: Date;

    @ApiProperty()
    @Expose()
    timeVesting: string;

    @ApiProperty()
    @Expose()
    vestingPlanId: number;

    @ApiProperty()
    @Expose()
    vestingPlanName: string;

    @ApiProperty()
    @Expose()
    sharesAllocated: number;

    @ApiProperty()
    @Expose()
    sharesVested: number;

    @ApiProperty()
    @Expose()
    sharesUnVested: number;
}
