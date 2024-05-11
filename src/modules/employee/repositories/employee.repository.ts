import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { EmployeeEntity } from "../entities/employee.entity";
import { CreateEmployeeDto } from "../dto/request/create_employee.dot";
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UpdateEmployeeDto } from "../dto/request/update_employee.dot";
import { EmployeeListFilterDto } from "../dto/request/employee_list_filter.dto";
import { DepartmentEntity } from "../../department/entities/department.entity";
import { ESOPEntity } from "../../esop/entities/esop.entity";
import { EmployeeVestedYearsEntity } from "../entities/employee_vested_years.entity";
import { UpdateEmployeeESOPDto } from "../dto/request/update_employee_esop.dto";
import { IsOrganizationHead } from "../types/founder.type";
import { CompanyEntity } from "../../company/entities/company.entity";

@EntityRepository(EmployeeEntity)
export class EmployeeRepository extends AbstractRepository<EmployeeEntity> {
    async getEmployeeById(employeeId: number, languageCode: string): Promise<EmployeeEntity> {
        const query = this.createQueryBuilder("employee")
            .select(["employee.id", "employee.fullName"])
            .where("employee.id = :id", {
                id: employeeId,
            });
        return query.getOne();
    }

    async getEmployeeWithFilters(
        userId: number,
        filter: EmployeeListFilterDto,
    ): Promise<{
        employees: EmployeeEntity[];
        totalCount: number;
    }> {
        const query = this.createQueryBuilder("employee")
            .leftJoinAndSelect("employee.reportingTo", "reportingTo")
            .leftJoinAndSelect("employee.esop", "esop")
            .leftJoinAndSelect("employee.department", "department")
            .leftJoin("department.company", "company")
            .leftJoin("company.user", "user")
            .where("user.id = :userId", { userId });

        // Apply filtering logic for fullName
        if (filter.fullName) {
            query.andWhere("employee.fullName LIKE :fullName", { fullName: `%${filter.fullName}%` });
        }

        // Apply filtering logic for title
        if (filter.title) {
            query.andWhere("employee.title LIKE :title", { title: `%${filter.title}%` });
        }

        query.skip(filter.skip).take(filter.take).orderBy("employee.createdAt", "ASC");

        const [employees, totalCount] = await query.getManyAndCount();
        return { employees, totalCount };
    }

    async createEmployee(
        companyId: number,
        createEmployeeDto: CreateEmployeeDto,
        unallocatedESOPShares: number,
    ): Promise<EmployeeEntity> {
        return this.manager.transaction(async (transactionalEntityManager) => {

            if (createEmployeeDto.isOrganizationHead === IsOrganizationHead.yes) {
                createEmployeeDto.reportingToId = null;
            }

            const employeeEntity = new EmployeeEntity();
            employeeEntity.fullName = createEmployeeDto.fullName;
            employeeEntity.phone = createEmployeeDto.phone;
            employeeEntity.birthDate = createEmployeeDto.birthDate;
            employeeEntity.taxNo = createEmployeeDto.taxNo;
            employeeEntity.socialSecurity = createEmployeeDto.socialSecurity;
            employeeEntity.email = createEmployeeDto.email;
            employeeEntity.yearlySalary = createEmployeeDto.yearlySalary;
            employeeEntity.monthlyCost = (createEmployeeDto.yearlySalary / 12.0) * 1.24;
            employeeEntity.childrenBelow18 = createEmployeeDto.childrenBelow18;
            employeeEntity.startDate = createEmployeeDto.startDate;
            employeeEntity.endDate = createEmployeeDto.endDate;
            employeeEntity.isFounder = createEmployeeDto.isFounder;
            employeeEntity.title = createEmployeeDto.title;
            employeeEntity.isOrganizationHead = createEmployeeDto.isOrganizationHead;
            employeeEntity.sharesAllocated = 0;

            if (createEmployeeDto.esopPlanId) {
                if (createEmployeeDto.sharesAllocated !== undefined) {
                    if (createEmployeeDto.sharesAllocated <= unallocatedESOPShares) {
                        employeeEntity.sharesAllocated = createEmployeeDto.sharesAllocated;
                    } else {
                        throw new BadRequestException(
                            "Remaining unallocated ESOP shares are insufficient for this employee's new allocated shares",
                        );
                    }
                } else {
                    throw new BadRequestException(
                        "The sharesAllocated is required",
                    );
                }
            }

            // Check if reportingToId exists in the DTO
            if (createEmployeeDto.reportingToId) {
                // Retrieve the related employee entity from the database
                const reportingToEmployee = await transactionalEntityManager.findOne(
                    EmployeeEntity,
                    createEmployeeDto.reportingToId,
                    { relations: ["department", "department.company"] },
                );

                // If the reportingToEmployee exists, assign it to the reportingTo property
                if (reportingToEmployee) {
                    // If reportingToEmployee is not from the same company, throw a UnauthorizedException
                    if (reportingToEmployee.department.company.id !== companyId) {
                        console.error("User doesn't have access to the reported to employee's company");
                        throw new UnauthorizedException(
                            "User doesn't have access to the reported to employee's company",
                        );
                    }
                    employeeEntity.reportingTo = reportingToEmployee;
                    employeeEntity.reportingToId = createEmployeeDto.reportingToId;
                } else {
                    // If reportingToEmployee doesn't exist, throw a NotFoundException
                    throw new NotFoundException("Reporting To ID not found.");
                }
            }

            const department = await transactionalEntityManager.findOne(
                DepartmentEntity,
                createEmployeeDto.departmentId,
                { relations: ["company"] },
            );

            if (department) {
                if (department.company.id !== companyId) {
                    console.error("User doesn't have access to this department's company");
                    throw new UnauthorizedException("User doesn't have access to this department's company");
                }
                employeeEntity.department = department;
            } else {
                throw new NotFoundException("Department not found.");
            }

            if (createEmployeeDto.esopPlanId) {
                const esop = await transactionalEntityManager.findOne(ESOPEntity, createEmployeeDto.esopPlanId, {
                    relations: ["company"],
                });

                if (esop) {
                    if (esop.company.id !== companyId) {
                        console.error("User doesn't have access to this ESOP's company");
                        throw new UnauthorizedException("User doesn't have access to this ESOP's company");
                    }
                    employeeEntity.esop = esop;
                    employeeEntity.sharesAllocated = createEmployeeDto.sharesAllocated;
                } else {
                    throw new NotFoundException("ESOP not found.");
                }
            }

            if (employeeEntity.isOrganizationHead === IsOrganizationHead.yes) {
                // remove the old head.
                const employeeEntityList: EmployeeEntity[] = await transactionalEntityManager.find(EmployeeEntity, {
                    where: {
                        department: {
                            company: department.company,
                        },
                        isOrganizationHead: IsOrganizationHead.yes,
                    },
                    relations: ["department", "department.company"]
                });

                if (employeeEntityList && employeeEntityList.length > 0) {
                    employeeEntityList.forEach(item => item.isOrganizationHead = IsOrganizationHead.no);
                    await transactionalEntityManager.save(employeeEntityList);
                }
            }

            // create employee
            const result = await transactionalEntityManager.save(employeeEntity);

            // create vested years entity for later esop shares calculations
            await transactionalEntityManager.save(EmployeeVestedYearsEntity, {
                vestedYears: 0,
                employee: result,
            });

            return result;
        });
    }

    async updateEmployee(
        employeeId: number,
        companyId: number,
        updateEmployeeDto: UpdateEmployeeDto,
        unallocatedESOPShares: number,
    ): Promise<EmployeeEntity> {
        return this.manager.transaction(async (transactionalEntityManager) => {

            if (updateEmployeeDto.isOrganizationHead === IsOrganizationHead.yes) {
                updateEmployeeDto.reportingToId = null;
            }

            const employee = await transactionalEntityManager.findOne(EmployeeEntity, employeeId, {
                relations: ["reportingTo", "department", "esop", "vestedYears", "department.company"],
            });

            if (!employee) {
                return null;
            }

            employee.fullName = updateEmployeeDto.fullName;
            employee.phone = updateEmployeeDto.phone;
            employee.birthDate = updateEmployeeDto.birthDate;
            employee.taxNo = updateEmployeeDto.taxNo;
            employee.socialSecurity = updateEmployeeDto.socialSecurity;
            employee.email = updateEmployeeDto.email;
            employee.yearlySalary = updateEmployeeDto.yearlySalary;
            employee.monthlyCost = (updateEmployeeDto.yearlySalary / 12.0) * 1.24;
            employee.childrenBelow18 = updateEmployeeDto.childrenBelow18;
            employee.isFounder = updateEmployeeDto.isFounder;
            employee.isOrganizationHead = updateEmployeeDto.isOrganizationHead;
            employee.title = updateEmployeeDto.title;

            // check changes in start & end dates to reset vested years
            const entityStartDate = new Date(employee.startDate);
            const updatedStartDate = new Date(updateEmployeeDto.startDate);
            if (entityStartDate.getTime() != updatedStartDate.getTime()) {
                employee.sharesVested = 0;
                employee.vestedYears.vestedYears = 0;
            } else if (updateEmployeeDto.endDate) {
                const entityEndDate = new Date(employee.endDate);
                const updatedEndDate = new Date(updateEmployeeDto.endDate);
                if (entityEndDate.getTime() !== updatedEndDate.getTime()) {
                    employee.sharesVested = 0;
                    employee.vestedYears.vestedYears = 0;
                }
            }
            employee.startDate = updateEmployeeDto.startDate;
            employee.endDate = updateEmployeeDto.endDate;

            if (updateEmployeeDto.esopPlanId === undefined) {
                employee.sharesVested = 0;
                employee.vestedYears.vestedYears = 0;
                employee.sharesAllocated = 0;
            } else if (!employee.esop || updateEmployeeDto.esopPlanId !== employee.esop.id) {
                if (updateEmployeeDto.sharesAllocated === undefined) {
                    throw new BadRequestException(
                        "The sharesAllocated is required",
                    );
                }

                if (updateEmployeeDto.sharesAllocated - employee.sharesAllocated <= unallocatedESOPShares) {
                    employee.sharesAllocated = updateEmployeeDto.sharesAllocated;
                    employee.sharesVested = 0;
                    employee.vestedYears.vestedYears = 0;
                } else {
                    throw new BadRequestException(
                        "Remaining unallocated ESOP shares are insufficient for this employee's new allocated shares",
                    );
                }

                const esop = await transactionalEntityManager.findOne(ESOPEntity, updateEmployeeDto.esopPlanId, {
                    relations: ["company"],
                });

                if (esop) {
                    if (esop.company.id !== companyId) {
                        console.error("User doesn't have access to this ESOP's company");
                        throw new UnauthorizedException("User doesn't have access to this ESOP's company");
                    }
                    employee.esop = esop;
                    employee.sharesAllocated = updateEmployeeDto.sharesAllocated;
                    employee.sharesVested = 0;
                    employee.vestedYears.vestedYears = 0;
                } else {
                    throw new NotFoundException("ESOP not found.");
                }
            } else if (updateEmployeeDto.sharesAllocated === undefined) {
                throw new BadRequestException(
                    "The sharesAllocated is required",
                );
            } else if (employee.sharesAllocated !== updateEmployeeDto.sharesAllocated) {
                if (updateEmployeeDto.sharesAllocated - employee.sharesAllocated <= unallocatedESOPShares) {
                    employee.sharesAllocated = updateEmployeeDto.sharesAllocated;
                    employee.sharesVested = 0;
                    employee.vestedYears.vestedYears = 0;
                } else {
                    throw new BadRequestException(
                        "Remaining unallocated ESOP shares are insufficient for this employee's new allocated shares",
                    );
                }
            }

            // Update reportingTo relationship if needed
            if (
                updateEmployeeDto.reportingToId !== undefined &&
                updateEmployeeDto.reportingToId !== employee.reportingTo?.id
            ) {
                if (updateEmployeeDto.reportingToId === null) {
                    // If reportingToId is null, remove the existing reportingTo relationship
                    employee.reportingTo = null;
                    employee.reportingToId = null;
                } else {
                    // If reportingToId is not null, find the corresponding employee and set it as the new reportingTo
                    const newReportingTo = await transactionalEntityManager.findOne(
                        EmployeeEntity,
                        updateEmployeeDto.reportingToId,
                        { relations: ["department", "department.company"] },
                    );
                    if (!newReportingTo) {
                        throw new NotFoundException("Reporting To ID not found.");
                    }

                    // If reportingToEmployee is not from the same company, throw a UnauthorizedException
                    if (newReportingTo.department.company.id !== companyId) {
                        console.error("User doesn't have access to the reported to employee's company");
                        throw new UnauthorizedException(
                            "User doesn't have access to the reported to employee's company",
                        );
                    }
                    employee.reportingTo = newReportingTo;
                    employee.reportingToId = newReportingTo.id;
                }
            }

            if (updateEmployeeDto.departmentId !== employee.department.id) {
                const department = await transactionalEntityManager.findOne(
                    DepartmentEntity,
                    updateEmployeeDto.departmentId,
                    { relations: ["company"] },
                );

                if (department) {
                    if (department.company.id !== companyId) {
                        console.error("User doesn't have access to the new department's company");
                        throw new UnauthorizedException("User doesn't have access to the new department's company");
                    }
                    employee.department = department;
                } else {
                    throw new NotFoundException("Department not found.");
                }
            }

            if (employee.isOrganizationHead === IsOrganizationHead.yes) {
                // remove the old head.
                const employeeEntityList: EmployeeEntity[] = await transactionalEntityManager.find(EmployeeEntity, {
                    where: {
                        department: {
                            company: employee.department.company,
                        },
                        isOrganizationHead: IsOrganizationHead.yes,
                    },
                    relations: ["department", "department.company"]
                });

                if (employeeEntityList && employeeEntityList.length > 0) {
                    employeeEntityList.forEach(item => item.isOrganizationHead = IsOrganizationHead.no);
                    await transactionalEntityManager.save(employeeEntityList);
                }
            }

            await transactionalEntityManager.save(EmployeeVestedYearsEntity, employee.vestedYears);

            const updatedEmployee = await transactionalEntityManager.save(EmployeeEntity, employee);

            return updatedEmployee;
        });
    }

    private calculateVestedYearsAndShares(employee: EmployeeEntity): {
        yearsVested: number;
        dueShares: number;
    } {
        const todayTime = new Date().getTime();
        const startDateTime = new Date(employee.startDate).getTime();
        const yearsVested = Math.floor((todayTime - startDateTime) / (1000 * 60 * 60 * 24 * 365));

        let accumulatedSharesPercentage = 0;
        const esopYears = employee.esop.years;
        for (let i = 0; i < yearsVested && i <= esopYears; i++) {
            accumulatedSharesPercentage += employee.esop[`year${i + 1}`];
        }
        const dueShares = Math.floor(employee.sharesAllocated * (accumulatedSharesPercentage / 100));
        return { yearsVested, dueShares };
    }

    public async updateEmployeeESOP(
        userCompany: CompanyEntity,
        employeeId: number,
        updateDto: UpdateEmployeeESOPDto,
        unallocatedESOPShares: number,
    ): Promise<EmployeeEntity> {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const employee = await transactionalEntityManager.findOne(EmployeeEntity, employeeId, {
                relations: ["vestedYears"],
            });
            if (updateDto.sharesAllocated - employee.sharesAllocated <= unallocatedESOPShares) {
                const esop = await transactionalEntityManager.findOne(ESOPEntity, updateDto.esopId, {
                    relations: ["company"],
                });
                if (!esop) {
                    throw new BadRequestException("ESOP not found");
                }
                if (userCompany.id !== esop.company.id) {
                    throw new BadRequestException("Your company has no access to this ESOP");
                }
                employee.esop = esop;
                employee.sharesAllocated = updateDto.sharesAllocated;

                const { yearsVested, dueShares } = this.calculateVestedYearsAndShares(employee);
                employee.sharesVested = dueShares;
                if (employee.vestedYears) {
                    employee.vestedYears.vestedYears = yearsVested;
                    await transactionalEntityManager.save(employee.vestedYears);
                } else {
                    const vestedYearsEntity = transactionalEntityManager.create(EmployeeVestedYearsEntity);
                    vestedYearsEntity.vestedYears = yearsVested;
                    vestedYearsEntity.employee = employee;
                    const newVYEntity = await transactionalEntityManager.save(vestedYearsEntity);
                    employee.vestedYears = newVYEntity;
                }
                return await transactionalEntityManager.save(employee);
            } else {
                throw new BadRequestException(
                    "Remaining unallocated ESOP shares are insufficient for this employee's new allocated shares",
                );
            }
        });
    }

    public async deleteEmployeeESOP(employeeId: number): Promise<EmployeeEntity> {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const employee = await transactionalEntityManager.findOne(EmployeeEntity, employeeId, {
                relations: ["vestedYears"],
            });

            employee.esop = null;
            employee.sharesAllocated = 0;
            employee.sharesVested = 0;
            if (employee.vestedYears) {
                employee.vestedYears.vestedYears = 0;
                await transactionalEntityManager.save(employee.vestedYears);
            } else {
                const vestedYears = transactionalEntityManager.create(EmployeeVestedYearsEntity);
                vestedYears.employee = employee;
                const newVestedYears = await transactionalEntityManager.save(vestedYears);
                employee.vestedYears = newVestedYears;
            }
            return await transactionalEntityManager.save(employee);
        });
    }

    public async getEmployeesWhoStartedXYearsAgo(
        yearsToVest: number,
        yearEnd: Date,
        yearStart: Date,
        amountToTake: number,
    ) {
        const todayDate = new Date();
        const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());
        const employees = await this.createQueryBuilder("employee")
            .leftJoinAndSelect("employee.esop", "esop")
            .leftJoinAndSelect("employee.vestedYears", "vestedYears")
            .where("employee.startDate <= :yearEnd", { yearEnd })
            .andWhere("employee.startDate > :yearStart", { yearStart })
            .andWhere("(employee.endDate IS NULL OR employee.endDate >= :oneYearAgo)", { oneYearAgo })
            .andWhere("employee.esop IS NOT NULL")
            .andWhere("employee.sharesAllocated > 0")
            .andWhere("vestedYears.vestedYears < :yearsToVest", { yearsToVest })
            .take(amountToTake)
            .getMany();

        return employees;
    }

    public async saveEmployeeVestedSharesAndYears(
        employees: EmployeeEntity[],
        vestedYears: EmployeeVestedYearsEntity[],
    ) {
        return this.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(vestedYears);
            await transactionalEntityManager.save(employees);
        });
    }
}
