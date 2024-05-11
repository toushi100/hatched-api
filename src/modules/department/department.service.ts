import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { DepartmentKeys } from "./translate.enum";
import { DepartmentRepository } from "./repositories/department.repository";
import { CreateDepartmentDto } from "./dto/request/create_department.dto";
import { CreatedDepartmentMapper } from "./mapper/created_department.mapper";
import { CreatedDepartmentDto } from "./dto/response/created_department.dto";
import { UpdateDepartmentDto } from "./dto/request/update_department.dto";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { DepartmentsListDto } from "./dto/response/departments_list.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyService } from "../company/services/company.service";
import { DepartmentEntity } from "./entities/department.entity";
import { CompanyKeys } from "../company/translate.enum";
import { QueueEventService } from "../queueEvent/queue-event.service";

@Injectable()
export class DepartmentService {
    constructor(
        public readonly departmentRepository: DepartmentRepository,
        public readonly createdDepartmentMapper: CreatedDepartmentMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        @Inject(forwardRef(() => QueueEventService))
        public readonly queueEventService: QueueEventService,
    ) { }

    public async getDepartments(
        userPayload: UserPayloadDto,
        paginationDto: PaginationDto,
    ): Promise<DepartmentsListDto> {
        const [dbDepartments, totalCount] = await this.departmentRepository.findAndCount({
            relations: ["employees", "company", "company.user"],
            where: {
                company: {
                    user: {
                        id: userPayload.id,
                    },
                },
            },
            take: paginationDto.take,
            skip: paginationDto.skip,
            order: { createdAt: "ASC" },
        });

        const departments: CreatedDepartmentDto[] = [];
        dbDepartments.forEach((dep) => {
            const dto = this.createdDepartmentMapper.fromEntityToDTO(CreatedDepartmentDto, dep);
            delete dto.employees;
            departments.push(dto);
        });

        return { departments, totalCount };
    }

    public async getDepartmentById(departmentId: number, language: string): Promise<CreatedDepartmentDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const department = await this.departmentRepository.findOne(departmentId, {
            relations: ["employees"],
        });

        if (!department) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.createdDepartmentMapper.fromEntityToDTO(CreatedDepartmentDto, department);
    }

    public async createDepartment(
        userPayloadDto: UserPayloadDto,
        createDepartmentDto: CreateDepartmentDto,
        language: string,
    ): Promise<CreatedDepartmentDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const newDepartment = new DepartmentEntity();
            newDepartment.name = createDepartmentDto.name;
            newDepartment.description = createDepartmentDto.description;
            newDepartment.company = await this.companyService.getCompanyByUserId(userPayloadDto.id, languageCode);

            const createdDepartment = await this.departmentRepository.save(newDepartment);

            await this.queueEventService.handleDepartmentCreatedEvent(userPayloadDto, createDepartmentDto, createdDepartment, language);

            return this.createdDepartmentMapper.fromEntityToDTO(CreatedDepartmentDto, createdDepartment);
        } catch (e) {
            console.log(`Can't create department: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DepartmentKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async updateDepartment(
        userPayload: UserPayloadDto,
        departmentId: number,
        updateDepartmentDto: UpdateDepartmentDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const department = await this.departmentRepository.findOne(
            departmentId, {
            relations: ["company", "financialItem", "budgetItem"]
        });
        if (!department) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.NOT_FOUND, {
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

        if (userCompany.id !== department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const updatedDepartment = await this.departmentRepository.save({
            id: departmentId,
            ...updateDepartmentDto,
        });

        if (!updatedDepartment) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (updateDepartmentDto.name && updatedDepartment.name !== department.name) {
            department.name = updateDepartmentDto.name;
            await this.queueEventService.handleDepartmentUpdateNameEvent(userPayload, department, language);
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(DepartmentKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteDepartment(
        userPayload: UserPayloadDto,
        departmentId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const department = await this.departmentRepository.findOne(
            departmentId, {
            relations: ["company", "financialItem", "budgetItem"]
        });

        if (!department) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.NOT_FOUND, {
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

        if (userCompany.id !== department.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        // Check if there are any employees in the department
        const employeeCount = await this.departmentRepository
            .createQueryBuilder('department')
            .innerJoin('department.employees', 'employee')
            .where('department.id = :departmentId', { departmentId })
            .getCount();

        if (employeeCount > 0) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(DepartmentKeys.DEPARTMENT_HAS_EMPLOYEES_CANT_DELETE, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.departmentRepository.delete(departmentId);

        await this.queueEventService.handleDepartmentDeleteEvent(userPayload, department, language);
        return {
            isSuccessful: true,
            message: await this.i18n.translate(DepartmentKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }
}
