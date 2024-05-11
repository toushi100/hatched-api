import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreatedDepartmentDto } from "./created_department.dto";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class DepartmentsListDto extends AbstractDto {
    @ApiProperty({ type: () => [CreatedDepartmentDto] })
    @Expose()
    departments: CreatedDepartmentDto[];

    @ApiProperty()
    @Expose()
    totalCount: number;
}
