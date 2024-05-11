import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { EmployeeVestingItemDto } from "../dto/response/employee_vesting_item.dto";
import { EmployeeEntity } from "../entities/employee.entity";

@Injectable()
export class EmployeesVestingMapper extends AbstractMapper<EmployeeVestingItemDto, EmployeeEntity> {
    fromEntityToDTO(
        destination: ClassType<EmployeeVestingItemDto>,
        sourceObject: EmployeeEntity,
    ): EmployeeVestingItemDto {
        const todayTime = new Date().getTime();
        const startDateTime = new Date(sourceObject.startDate).getTime();
        const yearsVesting = (todayTime - startDateTime) / (1000 * 60 * 60 * 24 * 365);

        return {
            employeeId: sourceObject.id,
            employeeName: sourceObject.fullName,
            employeeEmail: sourceObject.email,
            startDate: sourceObject.startDate,
            timeVesting: yearsVesting.toFixed(2),
            vestingPlanId: sourceObject.esop.id,
            vestingPlanName: sourceObject.esop.name,
            sharesAllocated: sourceObject.sharesAllocated,
            sharesVested: sourceObject.sharesVested,
            sharesUnVested: sourceObject.sharesAllocated - sourceObject.sharesVested,
        };
    }
}
