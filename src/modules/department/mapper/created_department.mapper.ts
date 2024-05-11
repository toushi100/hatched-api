import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedDepartmentDto } from "../dto/response/created_department.dto";
import { DepartmentEntity } from "../entities/department.entity";

@Injectable()
export class CreatedDepartmentMapper extends AbstractMapper<CreatedDepartmentDto, DepartmentEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(
        destination: ClassType<CreatedDepartmentDto>,
        sourceObject: DepartmentEntity,
    ): CreatedDepartmentDto {
        if (!sourceObject) {
            return null;
        }

        return {
            departmentId: sourceObject.id,
            name: sourceObject.name,
            description: sourceObject.description,
            employees: sourceObject.employees,
            noOfEmployees: sourceObject.employees?.length,
        };
    }
}
