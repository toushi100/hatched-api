import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { EmployeeEntity } from "../entities/employee.entity";
import { EmployeeListItemDto } from "../dto/response/employee_list_item.dto copy";

@Injectable()
export class EmployeeListItemMapper extends AbstractMapper<EmployeeListItemDto, EmployeeEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(destination: ClassType<EmployeeListItemDto>, sourceObject: EmployeeEntity): EmployeeListItemDto {
        if (!sourceObject) {
            return null;
        }

        return {
            employeeId: sourceObject.id,
            fullName: sourceObject.fullName,
            birthDate: sourceObject.birthDate,
            phone: sourceObject.phone,
            taxNo: sourceObject.taxNo,
            socialSecurity: sourceObject.socialSecurity,
            email: sourceObject.email,
            departmentId: sourceObject.department?.id,
            reportingToId: sourceObject.reportingTo?.id,
            yearlySalary: sourceObject.yearlySalary,
            childrenBelow18: sourceObject.childrenBelow18,
            startDate: sourceObject.startDate,
            endDate: sourceObject.endDate,
            isFounder: sourceObject.isFounder,
            esopPlanId: sourceObject.esop?.id,
            esopName: sourceObject.esop?.name,
            sharesAllocated: sourceObject.sharesAllocated,
            title: sourceObject.title,
            department: sourceObject.department
                ? {
                    departmentId: sourceObject.department.id,
                    name: sourceObject.department.name,
                    description: sourceObject.department.description,
                }
                : null,
            reportingTo: sourceObject?.reportingTo?.fullName || null,
            isOrganizationHead: sourceObject.isOrganizationHead,
        };
    }
}
