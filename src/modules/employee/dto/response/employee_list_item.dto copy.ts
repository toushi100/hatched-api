import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreateEmployeeDto } from "../request/create_employee.dot";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class EmployeeDepartmentDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    departmentId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    description: string;
}

export class EmployeeListItemDto extends CreateEmployeeDto {
    @ApiProperty()
    @Expose()
    employeeId: number;

    @ApiPropertyOptional()
    @Expose()
    reportingTo?: string;

    @ApiPropertyOptional()
    @Expose()
    esopName?: string;

    @ApiPropertyOptional({ type: () => EmployeeDepartmentDto })
    @Expose()
    department: EmployeeDepartmentDto;
}

export class EmployeeListDto extends AbstractDto {
    @ApiProperty({ type: () => [EmployeeListItemDto] })
    @Expose()
    employees: EmployeeListItemDto[];

    @ApiProperty()
    @Expose()
    totalCount: number;
}
