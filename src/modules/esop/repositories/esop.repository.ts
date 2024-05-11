import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { ESOPEntity } from "../entities/esop.entity";
import { UpdateESOPDto } from "../dto/request/update_esop.dto";
import { YearName } from "../dto/request/create_esop.dto";
import { EmployeeVestedYearsEntity } from "../../employee/entities/employee_vested_years.entity";

@EntityRepository(ESOPEntity)
export class ESOPRepository extends AbstractRepository<ESOPEntity> {
    public async updateESOP(planId: number, updateDto: UpdateESOPDto) {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const plan = await transactionalEntityManager.findOne(ESOPEntity, planId, {
                relations: ["employees", "employees.vestedYears"],
            });
            plan.name = updateDto.name;
            plan.years = updateDto.numberOfYears;
            for (const yearObject of updateDto.yearsDistribution) {
                plan[yearObject.yearName] = yearObject.sharesPercentage;
            }
            const updatedPlanYears = updateDto.yearsDistribution.map((year) => year.yearName);
            const nullYears = Object.values(YearName).filter((year) => !updatedPlanYears.includes(year));
            for (const year of nullYears) {
                plan[year] = null;
            }
            // reset vested years and shares calculations for all employees on this plan
            if (plan.employees.length > 0) {
                const vestedYearsToSave: EmployeeVestedYearsEntity[] = [];
                plan.employees.forEach((emp) => {
                    emp.sharesVested = 0;
                    if (emp.vestedYears) {
                        emp.vestedYears.vestedYears = 0;
                        vestedYearsToSave.push(emp.vestedYears);
                    } else {
                        const vestedYears = new EmployeeVestedYearsEntity();
                        vestedYears.employee = emp;
                        vestedYearsToSave.push(vestedYears);
                    }
                });
                await transactionalEntityManager.save(plan.employees);
                await transactionalEntityManager.save(vestedYearsToSave);
            }

            return await this.save(plan);
        });
    }

    public async deleteESOP(planId: number) {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const plan = await transactionalEntityManager.findOne(ESOPEntity, planId, {
                relations: ["employees", "employees.vestedYears"],
            });

            // reset vested years and shares calculations for all employees on this plan
            if (plan.employees.length > 0) {
                const vestedYearsToSave: EmployeeVestedYearsEntity[] = [];
                plan.employees.forEach((emp) => {
                    emp.sharesVested = 0;
                    emp.sharesAllocated = 0;
                    if (emp.vestedYears) {
                        emp.vestedYears.vestedYears = 0;
                        vestedYearsToSave.push(emp.vestedYears);
                    } else {
                        const vestedYears = new EmployeeVestedYearsEntity();
                        vestedYears.employee = emp;
                        vestedYearsToSave.push(vestedYears);
                    }
                });
                await transactionalEntityManager.save(plan.employees);
                await transactionalEntityManager.save(vestedYearsToSave);
            }
            await transactionalEntityManager.delete(ESOPEntity, planId);
        });
    }
}
