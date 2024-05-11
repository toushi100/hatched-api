import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    forwardRef,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { EmployeeKeys } from "./translate.enum";
import { EmployeeRepository } from "./repositories/employee.repository";
import { CreateEmployeeDto } from "./dto/request/create_employee.dot";
import { CreatedEmployeeMapper } from "./mapper/created_employee.mapper";
import { CreatedEmployeeDto } from "./dto/response/created_employee.dto";
import { UpdateEmployeeDto } from "./dto/request/update_employee.dot";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { EmployeeListFilterDto } from "./dto/request/employee_list_filter.dto";
import { EmployeeListItemMapper } from "./mapper/employee_list_item.mapper";
import { EmployeeEntity } from "./entities/employee.entity";
import { EmployeeListDto, EmployeeListItemDto } from "./dto/response/employee_list_item.dto copy";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyKeys } from "../company/translate.enum";
import { CompanyService } from "../company/services/company.service";
import { In, Not, IsNull } from "typeorm";
import { QueueEventService } from "../queueEvent/queue-event.service";
import { EmployeeOrgChartNodeMapper } from "./mapper/employee_org_chart_node.mapper";
import { EmployeeNodeDto } from "./dto/response/org_chart_employee_node.dto";
import { UpdateEmployeeESOPDto } from "./dto/request/update_employee_esop.dto";
import { ESOPService } from "../esop/esop.service";
import { EmployeeVestingItemDto } from "./dto/response/employee_vesting_item.dto";
import { EmployeesVestingMapper } from "./mapper/employees_vesting.mapper";
import { ConfigService } from "../../configs";
import { EmployeeVestedYearsEntity } from "./entities/employee_vested_years.entity";
import { IsOrganizationHead } from "./types/founder.type";

@Injectable()
export class EmployeeService {
    constructor(
        public readonly employeeRepository: EmployeeRepository,
        public readonly createdEmployeeMapper: CreatedEmployeeMapper,
        public readonly employeeListItemMapper: EmployeeListItemMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        @Inject(forwardRef(() => QueueEventService))
        public readonly queueEventService: QueueEventService,
        public readonly employeeOrgChartNodeMapper: EmployeeOrgChartNodeMapper,
        @Inject(forwardRef(() => ESOPService))
        public readonly esopService: ESOPService,
        public readonly employeesVestingMapper: EmployeesVestingMapper,
        public readonly configService: ConfigService,
    ) { }

    public async getEmployees(
        userPayload: UserPayloadDto,
        employeeListFilterDto: EmployeeListFilterDto,
    ): Promise<EmployeeListDto> {
        const result = await this.employeeRepository.getEmployeeWithFilters(userPayload.id, employeeListFilterDto);

        const employees = result.employees.map((employee: EmployeeEntity) =>
            this.employeeListItemMapper.fromEntityToDTO(EmployeeListItemDto, employee),
        );
        return {
            employees,
            totalCount: result.totalCount,
        };
    }

    public async getEmployee(employeeId: number, language: string): Promise<CreatedEmployeeDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const employee = await this.employeeRepository.findOne(employeeId, {
            relations: ["reportingTo", "department", "esop"],
        });

        if (!employee) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.createdEmployeeMapper.fromEntityToDTO(CreatedEmployeeDto, employee);
    }

    public async createEmployee(
        userPayload: UserPayloadDto,
        createEmployeeDto: CreateEmployeeDto,
        language: string,
    ): Promise<CreatedEmployeeDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!company) {
            console.error(`Can't find company for user id ${userPayload.id}`);
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const employeeCountWithGivenEmail = await this.employeeRepository.count({
            where: {
                email: createEmployeeDto.email,
            },
        });

        if (employeeCountWithGivenEmail > 0) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        let employee;
        try {
            const { notAllocated } = await this.esopService.getSharesDataForESOPs(userPayload, languageCode);
            employee = await this.employeeRepository.createEmployee(company.id, createEmployeeDto, notAllocated);
            await this.queueEventService.handleEmployeeCreatedEvent(userPayload, createEmployeeDto, employee, language);
        } catch (e) {
            console.log(`Can't create employee ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(EmployeeKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
        return this.createdEmployeeMapper.fromEntityToDTO(CreatedEmployeeDto, employee);
    }

    async updateEmployee(
        userPayload: UserPayloadDto,
        employeeId: number,
        updateEmployeeDto: UpdateEmployeeDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const employee = await this.employeeRepository.findOne(employeeId, {
            relations: ["department", "department.company"],
        });

        if (!employee) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const oldEmployeeData: EmployeeEntity = new EmployeeEntity();
        oldEmployeeData.id = employee.id;
        oldEmployeeData.yearlySalary = employee.yearlySalary;
        oldEmployeeData.startDate = employee.startDate;
        oldEmployeeData.endDate = employee.endDate;

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== employee.department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const employeeCountWithGivenEmail = await this.employeeRepository.count({
            where: {
                email: updateEmployeeDto.email,
                id: Not(employeeId),
            },
        });

        if (employeeCountWithGivenEmail > 0) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const currentEmployeeYearlySalary = employee.yearlySalary;
        const currentEmployeeDepartment = employee.department?.id;
        const { notAllocated } = await this.esopService.getSharesDataForESOPs(userPayload, languageCode);
        const employeeUpdated = await this.employeeRepository.updateEmployee(
            employeeId,
            userCompany.id,
            updateEmployeeDto,
            notAllocated,
        );
        if (!employeeUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        await this.queueEventService.handleEmployeeUpdatedEvent(
            userPayload,
            oldEmployeeData,
            employeeId,
            currentEmployeeYearlySalary,
            currentEmployeeDepartment,
            updateEmployeeDto,
            language);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(EmployeeKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteEmployee(
        userPayload: UserPayloadDto,
        employeeId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const employee = await this.employeeRepository.findOne(employeeId, {
            relations: ["department", "department.company", "department.financialItem", "department.budgetItem"],
        });

        if (!employee) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== employee.department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (employee.isOrganizationHead === IsOrganizationHead.yes) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.CANT_DELETE_ORGANIZATION_HEAD, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.employeeRepository.delete(employeeId);

        await this.queueEventService.handleEmployeeDeletedEvent(userPayload, employee, language);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(EmployeeKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getEmployeeSubordinates(
        companyId: number,
        language: string,
        employeeId?: number,
    ): Promise<EmployeeNodeDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const chartNodes: EmployeeNodeDto[] = [];
            let currentLevelNodes: EmployeeNodeDto[] = [];
            let headEmployee: EmployeeEntity = null;
            if (employeeId) {
                headEmployee = await this.employeeRepository.findOne(
                    { id: employeeId, department: { company: { id: companyId } } },
                    { relations: ["reportingTo", "department", "department.company"] },
                );
            } else {
                headEmployee = await this.employeeRepository.findOne(
                    { isOrganizationHead: IsOrganizationHead.yes, department: { company: { id: companyId } } },
                    { relations: ["reportingTo", "department", "department.company"], order: { createdAt: "ASC" } },
                );
            }

            if (headEmployee) {
                const headNode = this.employeeOrgChartNodeMapper.fromEntityToDTO(EmployeeNodeDto, headEmployee);
                currentLevelNodes.push(headNode);
                // if no employee id query, then include root employee (without parent) as part of the chart response
                if (!employeeId) {
                    chartNodes.push(headNode);
                }
                // get max 3 levels of subordinates below head
                for (let i = 0; i < 3; i++) {
                    const dbSubordinates = await this.employeeRepository.find({
                        where: { reportingToId: In(currentLevelNodes.map((emp) => emp.id)) },
                        relations: ["reportingTo", "department"],
                    });
                    if (dbSubordinates.length === 0) {
                        break;
                    }
                    const subordinatesNodes: EmployeeNodeDto[] = dbSubordinates.map((entity) =>
                        this.employeeOrgChartNodeMapper.fromEntityToDTO(EmployeeNodeDto, entity),
                    );

                    chartNodes.push(...subordinatesNodes);
                    currentLevelNodes = [...subordinatesNodes];
                }
                return chartNodes;
            }
            return [];
        } catch (e) {
            console.dir(e);
            console.error(`Can't get employee subordinates: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: this.i18n.translate(EmployeeKeys.SUBORDINATES_ERROR, { lang: languageCode }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyEmployees(companyId: number): Promise<EmployeeEntity[]> {
        const employees = await this.employeeRepository.find({
            where: { department: { company: { id: companyId } } },
            relations: ["department", "department.company", "esop"],
        });

        return employees;
    }

    public async getCompanyEmployeesTotalShares(companyId: number) {
        const query = this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoin("employee.department", "department")
            .leftJoin("department.company", "company")
            .where("company.id = :companyId", { companyId })
            .select([
                "SUM(employee.sharesAllocated) as totalSharesAllocated",
                "SUM(employee.sharesVested) as totalSharesVested",
            ]);

        const result = await query.getRawOne();
        return {
            totalEmployeesAllocatedShares: parseFloat(result.totalsharesallocated) || 0,
            totalEmployeesVestedShares: parseFloat(result.totalsharesvested) || 0,
        };
    }

    public async getESOPVestingEmployees(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<EmployeeVestingItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const employees = await this.employeeRepository.find({
                where: {
                    department: { company: userCompany },
                    esop: Not(IsNull()),
                },
                relations: ["department", "department.company", "esop"],
                order: { startDate: "ASC" },
            });

            const mappedDto: EmployeeVestingItemDto[] = employees.map((emp) =>
                this.employeesVestingMapper.fromEntityToDTO(EmployeeVestingItemDto, emp),
            );

            return mappedDto;
        } catch (e) {
            console.error(`Can't get company's ESOP vesting employees: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(EmployeeKeys.EMPLOYEES_VESTING_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async updateEmployeeESOP(
        userPayload: UserPayloadDto,
        employeeId: number,
        updateEmployeeESOPDto: UpdateEmployeeESOPDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const employee = await this.employeeRepository.findOne(employeeId, {
            relations: ["department", "department.company"],
        });

        if (!employee) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== employee.department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const { notAllocated } = await this.esopService.getSharesDataForESOPs(userPayload, languageCode);
        const employeeUpdated = await this.employeeRepository.updateEmployeeESOP(
            userCompany,
            employeeId,
            updateEmployeeESOPDto,
            notAllocated,
        );
        if (!employeeUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(EmployeeKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteEmployeeESOP(
        userPayload: UserPayloadDto,
        employeeId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const employee = await this.employeeRepository.findOne(employeeId, {
            relations: ["department", "department.company"],
        });

        if (!employee) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== employee.department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const employeeUpdated = await this.employeeRepository.deleteEmployeeESOP(employeeId);
        if (!employeeUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(EmployeeKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(EmployeeKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    private calculateEmployeesVestedShares(employee: EmployeeEntity, yearsVested: number): number {
        let accumulatedSharesPercentage = 0;
        const esopYears = employee.esop.years;
        for (let i = 0; i < yearsVested && i <= esopYears; i++) {
            accumulatedSharesPercentage += employee.esop[`year${i + 1}`];
        }
        const dueShares = Math.floor(employee.sharesAllocated * (accumulatedSharesPercentage / 100));
        return dueShares;
    }

    public async updateEmployeesVestedShares() {
        try {
            const todayDate = new Date();
            const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());
            const twoYearsAgo = new Date(todayDate.getFullYear() - 2, todayDate.getMonth(), todayDate.getDate());
            const threeYearsAgo = new Date(todayDate.getFullYear() - 3, todayDate.getMonth(), todayDate.getDate());
            const fourYearsAgo = new Date(todayDate.getFullYear() - 4, todayDate.getMonth(), todayDate.getDate());
            const fiveYearsAgo = new Date(todayDate.getFullYear() - 5, todayDate.getMonth(), todayDate.getDate());
            const eightYearsAgo = new Date(todayDate.getFullYear() - 8, todayDate.getMonth(), todayDate.getDate());
            const numberOfEmployeesToTake = this.configService.ENV_CONFIG.NO_OF_VESTING_EMPLOYEES_TO_UPDATE;

            const employeesToSave: EmployeeEntity[] = [];
            const vestedYearsToSave: EmployeeVestedYearsEntity[] = [];

            // update one year employees
            const oneYearEmployees = await this.employeeRepository.getEmployeesWhoStartedXYearsAgo(
                1,
                oneYearAgo,
                twoYearsAgo,
                numberOfEmployeesToTake,
            );
            oneYearEmployees.forEach((emp) => {
                const sharesVested = this.calculateEmployeesVestedShares(emp, 1);
                emp.sharesVested = sharesVested;
                employeesToSave.push(emp);
                emp.vestedYears.vestedYears = 1;
                vestedYearsToSave.push(emp.vestedYears);
            });

            // update two years employees
            const twoYearsEmployees = await this.employeeRepository.getEmployeesWhoStartedXYearsAgo(
                2,
                twoYearsAgo,
                threeYearsAgo,
                numberOfEmployeesToTake,
            );
            twoYearsEmployees.forEach((emp) => {
                const sharesVested = this.calculateEmployeesVestedShares(emp, 2);
                emp.sharesVested = sharesVested;
                employeesToSave.push(emp);
                emp.vestedYears.vestedYears = 2;
                vestedYearsToSave.push(emp.vestedYears);
            });

            // update three years employees
            const threeYearsEmployees = await this.employeeRepository.getEmployeesWhoStartedXYearsAgo(
                3,
                threeYearsAgo,
                fourYearsAgo,
                numberOfEmployeesToTake,
            );
            threeYearsEmployees.forEach((emp) => {
                const sharesVested = this.calculateEmployeesVestedShares(emp, 3);
                emp.sharesVested = sharesVested;
                employeesToSave.push(emp);
                emp.vestedYears.vestedYears = 3;
                vestedYearsToSave.push(emp.vestedYears);
            });

            // update four years employees
            const fourYearsEmployees = await this.employeeRepository.getEmployeesWhoStartedXYearsAgo(
                4,
                fourYearsAgo,
                fiveYearsAgo,
                numberOfEmployeesToTake,
            );
            fourYearsEmployees.forEach((emp) => {
                const sharesVested = this.calculateEmployeesVestedShares(emp, 4);
                emp.sharesVested = sharesVested;
                employeesToSave.push(emp);
                emp.vestedYears.vestedYears = 4;
                vestedYearsToSave.push(emp.vestedYears);
            });

            // update five years employees
            const fiveOrMoreYearsEmployees = await this.employeeRepository.getEmployeesWhoStartedXYearsAgo(
                5,
                fiveYearsAgo,
                eightYearsAgo,
                numberOfEmployeesToTake,
            );
            fiveOrMoreYearsEmployees.forEach((emp) => {
                const sharesVested = this.calculateEmployeesVestedShares(emp, 5);
                emp.sharesVested = sharesVested;
                employeesToSave.push(emp);
                emp.vestedYears.vestedYears = 5;
                vestedYearsToSave.push(emp.vestedYears);
            });

            if (employeesToSave.length > 0) {
                await this.employeeRepository.saveEmployeeVestedSharesAndYears(employeesToSave, vestedYearsToSave);
            }
        } catch (e) {
            console.error("could not update employees vested shares. Error: ", e);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new InternalServerErrorException({
                    message: await this.i18n.translate(EmployeeKeys.UPDATE_EMPLOYEES_VESTING_ERROR, {
                        lang: languagesCodes.Default,
                    }),
                });
            }
        }
    }
}
