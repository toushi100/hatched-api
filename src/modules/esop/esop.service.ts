import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { ESOPKeys } from "./translate.enum";
import { ESOPRepository } from "./repositories/esop.repository";
import { ESOPOptionsListItemMapper } from "./mapper/esop_options_list.mapper";
import { ESOPDto } from "./dto/response/esop.dto";
import { ESOPEntity } from "./entities/esop.entity";
import { CompanyEntity } from "../company/entities/company.entity";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyService } from "../company/services/company.service";
import { CreateESOPDto } from "./dto/request/create_esop.dto";
import { UpdateESOPDto } from "./dto/request/update_esop.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { ESOPSharesDataDto } from "./dto/response/esop_shares_data.dto";
import { UpdateTotalSharesDto } from "./dto/request/update_total_shares.dto";
import { TotalESOPRepository } from "./repositories/total_esop.repository";
import { EmployeeService } from "../employee/employee.service";
import { TotalESOPEntity } from "./entities/total_esop.entity";

@Injectable()
export class ESOPService {
    constructor(
        public readonly esopRepository: ESOPRepository,
        public readonly totalESOPRepository: TotalESOPRepository,
        public readonly esopOptionsListItemMapper: ESOPOptionsListItemMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        @Inject(forwardRef(() => EmployeeService))
        public readonly employeeService: EmployeeService,
    ) { }

    public async getESOPsList(userPayload: UserPayloadDto): Promise<ESOPDto[]> {
        const result = await this.esopRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: {
                    user: {
                        id: userPayload.id,
                    },
                },
            },
        });

        if (!result) {
            return [];
        }
        return result.map((plan: ESOPEntity) => this.esopOptionsListItemMapper.fromEntityToDTO(ESOPDto, plan));
    }

    public async getESOPById(
        userPayload: UserPayloadDto,
        planId: number,
        language: string,
        asEntity = false,
    ): Promise<ESOPDto | ESOPEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        const plan = await this.esopRepository.findOne(planId, { relations: ["company"] });

        if (!plan) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== plan.company.id) {
            console.error(`User ${userPayload.email} doesn't have access to this company ESOPs`);
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (asEntity) return plan;

        return this.esopOptionsListItemMapper.fromEntityToDTO(ESOPDto, plan);
    }

    public async createNewESOP(userPayload: UserPayloadDto, createEsopDto: CreateESOPDto, language: string) {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;

        const userCompany: CompanyEntity = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        const totalPercentage = createEsopDto.yearsDistribution.reduce((accumulator, object) => {
            return accumulator + object.sharesPercentage;
        }, 0);
        if (createEsopDto.numberOfYears !== createEsopDto.yearsDistribution.length) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.WRONG_LIST, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        if (totalPercentage !== 100) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.SHARES_PERCENTAGE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const plan = new ESOPEntity();
            plan.name = createEsopDto.name;
            plan.years = createEsopDto.numberOfYears;
            plan.company = userCompany;
            for (const yearObject of createEsopDto.yearsDistribution) {
                plan[yearObject.yearName] = yearObject.sharesPercentage;
            }
            await this.esopRepository.save(plan);

            return {
                isSuccessful: true,
                message: await this.i18n.translate(ESOPKeys.CREATED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } catch (e) {
            console.error(`Can't create company ESOPs: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: ESOPKeys.CREATION_ERROR,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async updateESOPById(
        userPayload: UserPayloadDto,
        planId: number,
        updateESOPDto: UpdateESOPDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;

        const userCompany: CompanyEntity = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        const totalPercentage = updateESOPDto.yearsDistribution.reduce((accumulator, object) => {
            return accumulator + object.sharesPercentage;
        }, 0);
        if (updateESOPDto.numberOfYears !== updateESOPDto.yearsDistribution.length) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.WRONG_LIST, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        if (totalPercentage !== 100) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ESOPKeys.SHARES_PERCENTAGE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        try {
            const plan = await this.esopRepository.findOne(planId, { relations: ["company"] });
            if (!plan) {
                throw new Error(
                    await this.i18n.translate(ESOPKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                );
            }
            if (userCompany.id !== plan.company.id) {
                console.error(`User ${userPayload.email} doesn't have access to this company ESOPs`);
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ESOPKeys.COMPANY_ACCESS_DENIED, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }
            await this.esopRepository.updateESOP(planId, updateESOPDto);

            return {
                isSuccessful: true,
                message: await this.i18n.translate(ESOPKeys.UPDATED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } catch (e) {
            console.error(`Can't update company ESOP: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: ESOPKeys.UPDATE_ERROR,
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async deleteESOPById(
        userPayload: UserPayloadDto,
        planId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const plan = await this.esopRepository.findOne(planId, { relations: ["company"] });

            if (!plan) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ESOPKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

            if (userCompany.id !== plan.company.id) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ESOPKeys.COMPANY_ACCESS_DENIED, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }
            await this.esopRepository.deleteESOP(planId);

            return {
                isSuccessful: true,
                message: await this.i18n.translate(ESOPKeys.DELETED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } catch (e) {
            console.error(`Can't delete company ESOP: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException({ message: ESOPKeys.CANT_DELETE }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    public async createCompanyTotalESOPShares(company: CompanyEntity, language: string) {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const newTotalESOPShares = new TotalESOPEntity();
            newTotalESOPShares.totalAllocatedShares = 0;
            newTotalESOPShares.company = company;
            await this.totalESOPRepository.save(newTotalESOPShares);
        } catch (e) {
            console.error(`Couldn't create company's total ESOP shares: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    { message: await this.i18n.translate(ESOPKeys.TOTAL_SHARES_ERROR, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async updateTotalAllocatedShares(
        userPayload: UserPayloadDto,
        totalSharesDto: UpdateTotalSharesDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const totalShares = await this.totalESOPRepository.findOne(
                { company: userCompany },
                { relations: ["company"] },
            );
            const { totalEmployeesAllocatedShares } = await this.employeeService.getCompanyEmployeesTotalShares(
                userCompany.id,
            );
            if (totalEmployeesAllocatedShares <= totalSharesDto.newTotalShares) {
                totalShares.totalAllocatedShares = totalSharesDto.newTotalShares;
                await this.totalESOPRepository.save(totalShares);
                return {
                    isSuccessful: true,
                    message: await this.i18n.translate(ESOPKeys.TOTAL_SHARES_UPDATED_SUCCESSFULLY, {
                        lang: languageCode,
                    }),
                };
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ESOPKeys.INSUFFICIENT_TOTAL_SHARES_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (e) {
            console.error(`Couldn't update company's total ESOP shares: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    { message: await this.i18n.translate(ESOPKeys.TOTAL_SHARES_ERROR, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getSharesDataForESOPs(userPayload: UserPayloadDto, language: string): Promise<ESOPSharesDataDto> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);
        return this.getCompanySharesDataForESOPs(userCompany, language);
    }

    public async getCompanySharesDataForESOPs(company: CompanyEntity, language: string): Promise<ESOPSharesDataDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const companyTotalShares = await this.totalESOPRepository.findOne(
                { company: company },
                { relations: ["company"] },
            );

            const { totalEmployeesAllocatedShares, totalEmployeesVestedShares } =
                await this.employeeService.getCompanyEmployeesTotalShares(company.id);

            const notAllocatedShares = companyTotalShares.totalAllocatedShares - totalEmployeesAllocatedShares;

            const allocatedButNotVested = totalEmployeesAllocatedShares - totalEmployeesVestedShares;

            const unallocatedAndNotVested = notAllocatedShares + allocatedButNotVested;

            return {
                allocatedToAllPlans: companyTotalShares.totalAllocatedShares,
                currentlyAllocatedUnderPlans: totalEmployeesAllocatedShares,
                notAllocated: notAllocatedShares,
                vested: totalEmployeesVestedShares,
                allocatedButNotVested,
                unallocatedAndNotVested,
            } as ESOPSharesDataDto;
        } catch (e) {
            console.error(`Couldn't get company's shares data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    { message: await this.i18n.translate(ESOPKeys.TOTAL_SHARES_ERROR, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyTotalESOPShares(companyId: number, language: string): Promise<number> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const companyTotalShares = await this.totalESOPRepository.findOne(
                { company: { id: companyId } },
                { relations: ["company"] },
            );

            return companyTotalShares.totalAllocatedShares;
        } catch (e) {
            console.error(`Couldn't get company's total ESOP shares: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    { message: await this.i18n.translate(ESOPKeys.TOTAL_SHARES_ERROR, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
