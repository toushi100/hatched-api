import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreateDepartmentDto } from "../request/create_department.dto";
import { EmployeeEntity } from "../../../employee/entities/employee.entity";

export class CreatedDepartmentDto extends CreateDepartmentDto {
    @ApiProperty()
    @Expose()
    departmentId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty({ type: () => [EmployeeEntity] })
    @Expose()
    employees?: EmployeeEntity[];

    @ApiProperty()
    @Expose()
    noOfEmployees?: number;
}
