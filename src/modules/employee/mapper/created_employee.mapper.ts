import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedEmployeeDto } from "../dto/response/created_employee.dto";
import { EmployeeEntity } from "../entities/employee.entity";

@Injectable()
export class CreatedEmployeeMapper extends AbstractMapper<CreatedEmployeeDto, EmployeeEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(destination: ClassType<CreatedEmployeeDto>, sourceObject: EmployeeEntity): CreatedEmployeeDto {
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
            sharesAllocated: sourceObject.sharesAllocated,
            title: sourceObject.title,
            isOrganizationHead: sourceObject.isOrganizationHead,
        };
    }
}
