import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreateEmployeeDto } from "../request/create_employee.dot";

export class CreatedEmployeeDto extends CreateEmployeeDto {
    @ApiProperty()
    @Expose()
    employeeId: number;
}
