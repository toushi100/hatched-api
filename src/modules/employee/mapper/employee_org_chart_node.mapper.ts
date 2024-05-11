import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { EmployeeNodeDto } from "../../employee/dto/response/org_chart_employee_node.dto";
import { EmployeeEntity } from "src/modules/employee/entities/employee.entity";
import { ClassType } from "class-transformer-validator";

@Injectable()
export class EmployeeOrgChartNodeMapper extends AbstractMapper<EmployeeNodeDto, EmployeeEntity> {
    public fromEntityToDTO(destination: ClassType<EmployeeNodeDto>, sourceObject: EmployeeEntity): EmployeeNodeDto {
        return {
            department: sourceObject.department ? sourceObject.department.name : "",
            id: sourceObject.id,
            name: sourceObject.fullName,
            title: sourceObject.title,
            parentId: sourceObject.reportingTo ? sourceObject.reportingTo.id.toString() : "",
        };
    }
}
