import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { CompanyKeys } from "../translate.enum";
import { CompanyRepository } from "../repositories/company.repository";
import { CreateCompanyDto } from "../dto/request/create_company.dto";
import { CreatedCompanyDto } from "../dto/response/created_company.dto";
import { UpdateCompanyDto } from "../dto/request/update_company.dto";
import { CompanyEntity } from "../entities/company.entity";
import { CreatedCompanyMapper } from "../mapper/createdCompany.mapper";
import { CreatedCompanyPlanDatesMapper } from "../mapper/createdCompanyPlanDates.mapper";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { CompanyPlanDateRepository } from "../repositories/company-plan-date.repository";
import { CompanyPlanDateEntity } from "../entities/company-plan-date.entity";
import { AcceleratorService } from "../../accelerator/accelerator.service";
import { InvitationService } from "./invitation.service";
import { UserService } from "../../core/user/user.service";
import { AcceleratorAndInvestors } from "../types/AcceleratorAndInvestors";
import { UpdateAcceleratorAndInvestorsPayload } from "../types/UpdateAcceleratorAndInvestorsPayload";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { UserRepository } from "../../core/user/repositories/user.repository";
import { CompanyEntityMapper } from "../mapper/CompanyEntity.mapper";
import { CompanyEntityDto } from "../dto/response/company_entity.dto";
import { CreatedCompanyPlanDatesDto } from "../dto/response/created_company_plan_dates.dto";
import { CreateCompanyPlanDatesDto } from "../dto/request/create_company_plan_dates.dto";
import { UpdateCompanyPlanDatesDto } from "../dto/request/update_company_plan_dates.dto";
import { ItemDto } from "../types/Item";
import { ItemRepository } from "../repositories/item.repository";
import { ItemEntity } from "../entities/item.entity";
import { EmployeeService } from "src/modules/employee/employee.service";
import { GetOrgChartQueryDto } from "../dto/request/org_chart_query.dto";
import { EmployeeNodeDto } from "../../../modules/employee/dto/response/org_chart_employee_node.dto";
import { QueueEventService } from "src/modules/queueEvent/queue-event.service";
import { ESOPService } from "../../esop/esop.service";
import { UpdateFinancialYearsDto } from "../dto/request/update_company_financial_years.dto";
import { CompanyFinancialYearsDto } from "../dto/response/company_financial_years.dto";
import { ProfitLossService } from "../../../modules/profit_and_loss/services/profit-loss.service";
import { HelperService } from "src/shared/services/helper";

@Injectable()
export class CompanyService {
    constructor(
        public readonly companyRepository: CompanyRepository,
        public readonly userRepository: UserRepository,
        public readonly createdCompanyMapper: CreatedCompanyMapper,
        public readonly companyEntityMapper: CompanyEntityMapper,
        public readonly companyPlanDateRepository: CompanyPlanDateRepository,
        @Inject(forwardRef(() => AcceleratorService))
        public readonly acceleratorService: AcceleratorService,
        @Inject(forwardRef(() => InvitationService))
        public readonly invitationService: InvitationService,
        public readonly i18n: I18nService,
        @Inject(forwardRef(() => UserService))
        public readonly userService: UserService,
        public readonly createdCompanyPlanDatesMapper: CreatedCompanyPlanDatesMapper,
        public readonly itemRepository: ItemRepository,
        @Inject(forwardRef(() => EmployeeService))
        public readonly employeeService: EmployeeService,
        @Inject(forwardRef(() => QueueEventService))
        public readonly queueEventService: QueueEventService,
        @Inject(forwardRef(() => ESOPService))
        public readonly esopService: ESOPService,
        private readonly helperService: HelperService,
    ) { }

    public async createCompany(createCompanyDto: CreateCompanyDto, language?: string): Promise<CompanyEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const newCompany = this.companyRepository.create(createCompanyDto);
        const company = await this.companyRepository.save(newCompany);
        await this.esopService.createCompanyTotalESOPShares(company, languageCode);

        return company;
    }

    public async getCompanyById(
        companyId: number,
        language: string,
        asEntity = false,
    ): Promise<CreatedCompanyDto | CompanyEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyRepository.findOne(companyId);

        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (asEntity) return company;

        return this.createdCompanyMapper.fromEntityToDTO(CreatedCompanyDto, company);
    }

    public async getCompanyPlanEntity(companyId: number, language: string): Promise<CompanyPlanDateEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const companyPlan = await this.companyPlanDateRepository.findOne({
            where: {
                company: {
                    id: companyId,
                },
            },
        });

        if (!companyPlan) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return companyPlan;
    }

    async updateCompany(
        companyId: number,
        updateCompanyDto: UpdateCompanyDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyRepository.findOne(companyId);

        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (updateCompanyDto.name) company.name = updateCompanyDto.name;
        if (updateCompanyDto.logo) company.logo = updateCompanyDto.logo;
        if (updateCompanyDto.website) company.website = updateCompanyDto.website;
        if (updateCompanyDto.iosURL) company.iosURL = updateCompanyDto.iosURL;
        if (updateCompanyDto.playStoreURL) company.playStoreURL = updateCompanyDto.playStoreURL;
        if (updateCompanyDto.fbURL) company.fbURL = updateCompanyDto.fbURL;
        if (updateCompanyDto.igURL) company.igURL = updateCompanyDto.igURL;
        if (updateCompanyDto.linkedinURL) company.linkedinURL = updateCompanyDto.linkedinURL;
        if (updateCompanyDto.twitterURL) company.twitterURL = updateCompanyDto.twitterURL;

        const companyUpdated = await this.companyRepository.save(company);
        if (!companyUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(CompanyKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteCompany(companyId: number, language: string): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyRepository.findOne(companyId);

        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.companyRepository.delete(companyId);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(CompanyKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async retrieveUserCompany(userPayload: UserPayloadDto, language: string): Promise<CompanyEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.getUserWithCompany(userPayload.id);

        if (!user || !user.company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return user.company;
    }

    async getUserCompany(userPayload: UserPayloadDto, language: string): Promise<CompanyEntityDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userService.getUserWithCompany(userPayload.id);

        if (!user || !user.company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return this.companyEntityMapper.transformToDTO(user);
    }

    async updateCompanySettings(
        userPayload: UserPayloadDto,
        language: string,
        updateCompanyDto: UpdateCompanyDto,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;

        const company = await this.retrieveUserCompany(userPayload, language);
        if (updateCompanyDto.name) company.name = updateCompanyDto.name;
        if (updateCompanyDto.logo !== undefined) company.logo = updateCompanyDto.logo;
        if (updateCompanyDto.website !== undefined) company.website = updateCompanyDto.website;
        if (updateCompanyDto.iosURL !== undefined) company.iosURL = updateCompanyDto.iosURL;
        if (updateCompanyDto.playStoreURL !== undefined) company.playStoreURL = updateCompanyDto.playStoreURL;
        if (updateCompanyDto.fbURL !== undefined) company.fbURL = updateCompanyDto.fbURL;
        if (updateCompanyDto.igURL !== undefined) company.igURL = updateCompanyDto.igURL;
        if (updateCompanyDto.linkedinURL !== undefined) company.linkedinURL = updateCompanyDto.linkedinURL;
        if (updateCompanyDto.twitterURL !== undefined) company.twitterURL = updateCompanyDto.twitterURL;
        if (updateCompanyDto.jobTitle !== undefined)
            await this.userRepository.save({
                id: userPayload.id,
                jobTitle: updateCompanyDto.jobTitle,
            });
        if (updateCompanyDto.acceleratorId === null) {
            company.accelerator = null;
        }
        if (updateCompanyDto.acceleratorId) {
            const accelerator = await this.acceleratorService.getAcceleratorById(
                updateCompanyDto.acceleratorId,
                languageCode,
            );
            if (accelerator) company.accelerator = accelerator;
        }

        await this.companyRepository.save(company);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(CompanyKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getCompanyByUserId(userId: number, language: string): Promise<CompanyEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const query = this.companyRepository
            .createQueryBuilder("company")
            .leftJoin("company.user", "user")
            .where("user.id = :userId", { userId })
            .select(["company.id", "company.name"]);
        const company = await query.getOne();
        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return company;
    }

    public async getCompanyAcceleratorAndInvestors(userId: number, language: string): Promise<AcceleratorAndInvestors> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyRepository.findOne({
            relations: ["user", "investors", "accelerator", "accelerator.user"],
            where: { user: { id: userId } },
        });
        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return {
            investors: company.investors,
            accelerator: company.accelerator,
        };
    }

    public async updateCompanyInvestorsAndAccelerator(
        companyId: number,
        updatePayload: UpdateAcceleratorAndInvestorsPayload,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode = languagesCodes[language] || languagesCodes.Default;

        const company = await this.companyRepository.findOne(companyId, { relations: ["investors"] });
        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updatePayload.acceleratorId) {
            const accelerator = await this.acceleratorService.getAcceleratorById(
                updatePayload.acceleratorId,
                languageCode,
            );
            if (accelerator) company.accelerator = accelerator;
        }
        if (updatePayload.investorsIds?.length) {
            const newInvestorsIds = updatePayload.investorsIds.filter(
                (newInvestorId) => !company.investors.some((dbInvestor) => newInvestorId === dbInvestor.id),
            );
            const newCompanyInvestors = newInvestorsIds.length
                ? await this.userService.getUsersByIds(newInvestorsIds)
                : [];
            company.investors = [...company.investors, ...newCompanyInvestors];
        }

        await this.companyRepository.save(company);
        return {
            isSuccessful: true,
            message: await this.i18n.translate(CompanyKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async deleteCompanyInvestorRelations(
        userId: number,
        emailToDelete: string,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const company = await this.companyRepository.findOne({
            relations: ["user", "investors", "accelerator", "accelerator.user"],
            where: { user: { id: userId } },
        });
        if (!company) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, { lang: languageCode }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // if accelerator, set company accelerator as NULL
        if (company.accelerator?.user.email === emailToDelete) company.accelerator = null;

        // if investor, update company investors list and remove it from the list
        const remainingInvestorsList = company.investors.filter((inv) => inv.email !== emailToDelete);
        company.investors = remainingInvestorsList;

        await this.companyRepository.save(company);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(CompanyKeys.DELETED_SUCCESSFULLY, { lang: languageCode }),
        };
    }

    public async createCompanyItem(companyId: number, itemDto: ItemDto, language: string): Promise<ItemEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const item = new ItemEntity();
        item.name = itemDto.name;
        item.description = itemDto.description;

        const company = new CompanyEntity();
        company.id = companyId;

        item.company = company;

        const createdItem = await this.itemRepository.save(item);

        return createdItem;
    }

    public async getCompanyItemEntityByBudgetItemId(
        companyId: number,
        budgetItemId: number,
        language: string,
    ): Promise<ItemEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const item = await this.itemRepository.findOne({
            where: {
                company: {
                    id: companyId,
                },
                budgetItem: {
                    id: budgetItemId,
                },
            },
            relations: ["company", "financialItem", "budgetItem"],
        });

        return item;
    }

    private arePlanDatesValid(startYear: number, startMonth: number, endYear: number, endMonth: number): boolean {
        if (startMonth < 6 && endMonth === 11 && endYear === startYear) return true;
        if (startMonth < 6 && endMonth === 11 && endYear === startYear + 1) return true;
        if (startMonth >= 6 && endMonth === 11 && endYear === startYear + 1) return true;
        if (startMonth === endMonth + 1 && endYear === startYear + 1) return true;

        return false;
    }

    public async createCompanyPlanDates(
        userPayload: UserPayloadDto,
        createPlanDatesDto: CreateCompanyPlanDatesDto,
        language: string,
    ): Promise<CreatedCompanyPlanDatesDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.getCompanyByUserId(userPayload.id, languageCode);

            const budgetStartDate = new Date(createPlanDatesDto.budgetStartDate);
            const budgetEndDate = new Date(createPlanDatesDto.budgetEndDate);

            const areValidDates = this.arePlanDatesValid(
                budgetStartDate.getFullYear(),
                budgetStartDate.getMonth(),
                budgetEndDate.getFullYear(),
                budgetEndDate.getMonth(),
            );

            if (!areValidDates) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.INVALID_PLAN_DATES, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const financialStartDate = new Date(budgetEndDate);
            financialStartDate.setMonth(financialStartDate.getMonth() + 3);
            const financialEndDate = new Date(financialStartDate);
            financialEndDate.setMonth(financialEndDate.getMonth() + 7 * 3); // 2 years

            const companyPlanDate = new CompanyPlanDateEntity();
            companyPlanDate.budgetStartDate = budgetStartDate;
            companyPlanDate.budgetEndDate = budgetEndDate;

            companyPlanDate.financialStartDate = financialStartDate;
            companyPlanDate.financialEndDate = financialEndDate;
            companyPlanDate.company = company;

            const createdPlanDate = await this.companyPlanDateRepository.save(companyPlanDate);

            // create the Default budget/financial/P&L items
            await this.queueEventService.handleCompanyPlanDatesCreatedEvent(userPayload, createPlanDatesDto, language);

            return this.createdCompanyPlanDatesMapper.fromEntityToDTO(CreatedCompanyPlanDatesDto, createdPlanDate);
        } catch (e) {
            console.log(`Could not create company plan dates: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyPlanDates(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<CreatedCompanyPlanDatesDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.getCompanyByUserId(userPayload.id, languageCode);
            const companyPlanDate = await this.companyPlanDateRepository.findOne({
                where: { company },
                relations: ["company"],
            });

            return this.createdCompanyPlanDatesMapper.fromEntityToDTO(CreatedCompanyPlanDatesDto, companyPlanDate);
        } catch (e) {
            console.log(`Could not fetch company plan dates: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async updateCompanyPlanDates(
        userPayload: UserPayloadDto,
        updatePlanDatesDto: UpdateCompanyPlanDatesDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.getCompanyByUserId(userPayload.id, languageCode);
            const companyPlanDate = await this.companyPlanDateRepository.findOne({
                where: { company },
                relations: ["company"],
            });

            if (!companyPlanDate) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const budgetStartDate = new Date(updatePlanDatesDto.budgetStartDate);
            const budgetEndDate = new Date(updatePlanDatesDto.budgetEndDate);

            const areValidDates = this.arePlanDatesValid(
                budgetStartDate.getFullYear(),
                budgetStartDate.getMonth(),
                budgetEndDate.getFullYear(),
                budgetEndDate.getMonth(),
            );

            if (!areValidDates) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.INVALID_PLAN_DATES, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const oldCompanyPlanDate = new CompanyPlanDateEntity();
            oldCompanyPlanDate.id = companyPlanDate.id;
            oldCompanyPlanDate.budgetStartDate = new Date(companyPlanDate.budgetStartDate);
            oldCompanyPlanDate.budgetEndDate = new Date(companyPlanDate.budgetEndDate);
            oldCompanyPlanDate.financialStartDate = new Date(companyPlanDate.financialStartDate);
            oldCompanyPlanDate.financialEndDate = new Date(companyPlanDate.financialEndDate);

            const financialStartDate = new Date(budgetEndDate);
            financialStartDate.setMonth(financialStartDate.getMonth() + 3);
            const financialEndDate = new Date(financialStartDate);

            const monthDiff = this.helperService.getMonthDiff(companyPlanDate.financialStartDate, companyPlanDate.financialEndDate);
            financialEndDate.setMonth(financialEndDate.getMonth() + monthDiff); // 2 or 4 years

            companyPlanDate.budgetStartDate = budgetStartDate;
            companyPlanDate.budgetEndDate = budgetEndDate;

            companyPlanDate.financialStartDate = financialStartDate;
            companyPlanDate.financialEndDate = financialEndDate;


            const newCompanyPlanDate = new CompanyPlanDateEntity();
            newCompanyPlanDate.id = companyPlanDate.id;
            newCompanyPlanDate.budgetStartDate = new Date(companyPlanDate.budgetStartDate);
            newCompanyPlanDate.budgetEndDate = new Date(companyPlanDate.budgetEndDate);
            newCompanyPlanDate.financialStartDate = new Date(companyPlanDate.financialStartDate);
            newCompanyPlanDate.financialEndDate = new Date(companyPlanDate.financialEndDate);

            await this.companyPlanDateRepository.save(companyPlanDate);

            // handle update dates
            await this.queueEventService.handleCompanyPlanDatesUpdatedEvent(userPayload,
                oldCompanyPlanDate, newCompanyPlanDate, language);

            return {
                isSuccessful: true,
                message: await this.i18n.translate(CompanyKeys.PLAN_DATES_UPDATED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } catch (e) {
            console.log(`Could not update company plan dates: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_UPDATE_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getUserCompanyOrganizationChart(
        userPayload: UserPayloadDto,
        orgChartQueryDto: GetOrgChartQueryDto,
        language: string,
    ): Promise<EmployeeNodeDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.getCompanyByUserId(userPayload.id, languageCode);
            return this.getCompanyOrganizationChart(userCompany.id, orgChartQueryDto, languageCode);
        } catch (e) {
            throw e;
        }
    }

    public async getCompanyOrganizationChart(
        companyId: number,
        orgChartQueryDto: GetOrgChartQueryDto,
        language: string,
    ): Promise<EmployeeNodeDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = (await this.getCompanyById(companyId, languageCode, true)) as CompanyEntity;

            const chartEmployeeNodes = await this.employeeService.getEmployeeSubordinates(
                company.id,
                languageCode,
                orgChartQueryDto.headEmployeeId,
            );
            return chartEmployeeNodes;
        } catch (e) {
            console.error(`Can't get company organization chart: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: this.i18n.translate(CompanyKeys.ORG_CHART_ERROR, { lang: languageCode }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyFinancialYears(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<CompanyFinancialYearsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.getCompanyByUserId(userPayload.id, languageCode);
            const companyPlanDate = await this.companyPlanDateRepository.findOne({
                where: { company },
                relations: ["company"],
            });

            if (!companyPlanDate) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            const startDate = new Date(companyPlanDate.financialStartDate);
            startDate.setMonth(startDate.getMonth() + 7 * 3); // 2 years
            let numberOfYears: number = 0;
            if (startDate.getMonth() === companyPlanDate.financialEndDate.getMonth() && startDate.getFullYear() === companyPlanDate.financialEndDate.getFullYear()) {
                numberOfYears = 3;
            } else {
                numberOfYears = 5;
            }
            return { numberOfYears };
        } catch (e) {
            console.log(`Could not fetch company financial years: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.FINANCIAL_YEARS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async updateCompanyFinancialYears(
        userPayload: UserPayloadDto,
        updateFinancialYearsDto: UpdateFinancialYearsDto,
        language: string,
    ) {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.getCompanyByUserId(userPayload.id, languageCode);
            const companyPlanDate = await this.companyPlanDateRepository.findOne({
                where: { company },
                relations: ["company"],
            });

            if (!companyPlanDate) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const startDate = new Date(companyPlanDate.financialStartDate);
            startDate.setMonth(startDate.getMonth() + 7 * 3); // 2 years
            let oldNumberYears: number = 0;
            if (startDate.getMonth() === companyPlanDate.financialEndDate.getMonth() && startDate.getFullYear() === companyPlanDate.financialEndDate.getFullYear()) {
                oldNumberYears = 3;
            } else {
                oldNumberYears = 5;
            }
            const newNumberYears: number = updateFinancialYearsDto.numberOfYears;

            const oldCompanyPlanDate = new CompanyPlanDateEntity();
            oldCompanyPlanDate.id = companyPlanDate.id;
            oldCompanyPlanDate.budgetStartDate = new Date(companyPlanDate.budgetStartDate);
            oldCompanyPlanDate.budgetEndDate = new Date(companyPlanDate.budgetEndDate);
            oldCompanyPlanDate.financialStartDate = new Date(companyPlanDate.financialStartDate);
            oldCompanyPlanDate.financialEndDate = new Date(companyPlanDate.financialEndDate);

            // less by a year considering budget year is always the first year of financial years
            const newFinancialEndDate = new Date(companyPlanDate.financialStartDate);
            newFinancialEndDate.setMonth(newFinancialEndDate.getMonth() + (updateFinancialYearsDto.numberOfYears - 1) * 12 - 3); // 2 or 4 years

            companyPlanDate.financialEndDate = newFinancialEndDate;

            await this.companyPlanDateRepository.save(companyPlanDate);

            const newCompanyPlanDate = new CompanyPlanDateEntity();
            newCompanyPlanDate.id = companyPlanDate.id;
            newCompanyPlanDate.budgetStartDate = new Date(companyPlanDate.budgetStartDate);
            newCompanyPlanDate.budgetEndDate = new Date(companyPlanDate.budgetEndDate);
            newCompanyPlanDate.financialStartDate = new Date(companyPlanDate.financialStartDate);
            newCompanyPlanDate.financialEndDate = new Date(companyPlanDate.financialEndDate);

            // handle update years
            await this.queueEventService.handleCompanyFinancialYearsUpdatedEvent(userPayload,
                oldCompanyPlanDate, newCompanyPlanDate, oldNumberYears, newNumberYears, language);

            return {
                isSuccessful: true,
                message: await this.i18n.translate(CompanyKeys.PLAN_DATES_UPDATED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } catch (e) {
            console.dir(e);
            console.log(`Could not update company financial years: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_UPDATE_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
