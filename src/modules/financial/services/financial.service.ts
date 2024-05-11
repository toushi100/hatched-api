import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { FinancialItemKeys, FinancialQuarterKeys } from "../translate.enum";
import { FinancialItemRepository } from "../repositories/financial-item.repository";
import { CreateFinancialItemDto } from "../dto/request/create_financial_item.dto";
import { CreatedFinancialItemMapper } from "../mapper/created_financial_item.mapper";
import { FinancialItemsListMapper } from "../mapper/financial_items_list.mapper";
import { CreatedFinancialItemDto } from "../dto/response/created_financial_item.dto";
import { UpdateFinancialQuarterItemDto } from "../dto/request/update_financial_quarter_item.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { BudgetCategoryService } from "../../budget/budget-category/budget-category.service";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../company/services/company.service";
import { FinancialItemDirectCostService } from "./financial-item-direct-cost.service";
import { FinancialItemManualCostService } from "./financial-item-manual-cost.service";
import { FinancialItemRevenueService } from "./financial-item-revenue.service";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialDirectCostsItemDto } from "../dto/request/direct_cost_data.dto";
import { FinancialRevenueItemDto } from "../dto/request/revenue_data.dto";
import { FinancialOtherItemsDto } from "../dto/request/other_data.dto";
import { FinancialQuarterRepository } from "../repositories/financial-quarter.repository";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { FinancialItemsListDto } from "../dto/response/financial_items_list.dto";
import { UpdateFinancialItemDto } from "../dto/request/update_financial_item.dto";
import { FinancialQuarterItemMapper } from "../mapper/financial_quarter_item.mapper";
import { FinancialQuarterItemDto } from "../dto/response/financial_quarter_item.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { FinancialQuarterRatioRepository } from "../repositories/financial-quarter-ratio.repository";
import { FinancialSharedService } from "./financial-shared.service";
import { FinancialQuarterRatioEntity } from "../entities/financial-quarter-ratio.entity";
import { ItemEntity } from "src/modules/company/entities/item.entity";
import { BudgetItemService } from "src/modules/budget/budget-item/services/budget-item.service";
import { BudgetItemsListDto } from "src/modules/budget/budget-item/dto/response/budget_items_list.dto";
import { CompanyKeys } from "src/modules/company/translate.enum";
import { HelperService } from "src/shared/services/helper";

@Injectable()
export class FinancialService {
    constructor(
        public readonly financialItemRepository: FinancialItemRepository,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        public readonly budgetCategoryService: BudgetCategoryService,
        public readonly createdFinancialItemMapper: CreatedFinancialItemMapper,
        public readonly financialItemsListMapper: FinancialItemsListMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly financialItemDirectCostService: FinancialItemDirectCostService,
        public readonly financialItemManualCostService: FinancialItemManualCostService,
        public readonly financialItemRevenueService: FinancialItemRevenueService,
        public readonly financialQuarterItemMapper: FinancialQuarterItemMapper,
        public readonly financialQuarterRatioRepository: FinancialQuarterRatioRepository,
        public readonly financialSharedService: FinancialSharedService,
        @Inject(forwardRef(() => BudgetItemService))
        public readonly budgetItemService: BudgetItemService,
        private readonly helperService: HelperService,
    ) { }

    public async getFinancialItems(userPayload: UserPayloadDto): Promise<FinancialItemsListDto> {
        const dbFinancialItems = await this.financialItemRepository.find({
            relations: ["item", "item.budgetItem", "company", "company.user", "budgetCategory", "financialQuarters"],
            where: { company: { user: { id: userPayload.id } } },
            order: {
                createdAt: "ASC",
            },
        });

        const quarterRatios = await this.financialQuarterRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: { user: { id: userPayload.id } },
            },
            order: {
                quarterDate: "ASC",
            },
        });

        const budgetItemsListDto: BudgetItemsListDto = await this.budgetItemService.getBudgetItems(userPayload);

        return this.financialItemsListMapper.fromEntityToDTO(
            FinancialItemsListDto, dbFinancialItems, quarterRatios, budgetItemsListDto);
    }

    public async updatePersonnelCostsFinancialQuarterItem(
        userPayload: UserPayloadDto,
        financialItemId: number,
        startDate: Date,
        endDate: Date,
        monthlySalary: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: [
                "company",
                "budgetCategory",
                "financialQuarters",
                "financialQuarters.financialQuarterRatio",
                "financialQuarters.financialItemManualCosts",
            ],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (financialItem.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS) {
            const updated = await this.financialItemManualCostService.updatePersonnelCostsFinancialManual(
                userPayload,
                userCompany,
                financialItem,
                startDate,
                endDate,
                monthlySalary,
                language,
            );
            console.log(updated);
        } else {
            throw new HttpException({ message: "Couldn't find budget PERSONNEL_COSTS category type" }, HttpStatus.NOT_FOUND);
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(FinancialItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    // async updateFinancialByEmployeeListener(
    //     userPayload: UserPayloadDto,
    //     financialItemId: number,
    //     quarterSalary: number,
    //     language: string,
    // ): Promise<void> {
    //     const financial_item = await this.getFinancialItemById(userPayload, financialItemId, language);

    //     const first_financial_quarter: FinancialQuarterEntity = await this.getFirstQuarterByFinancialItemId(
    //         financialItemId,
    //     );

    //     const financialData: FinancialOtherItemsDto = {
    //         amount: first_financial_quarter.value + quarterSalary,
    //         expectedQuarterlyGrowth: 0,
    //     };
    //     const updateFinancialQuarterItemDto: UpdateFinancialQuarterItemDto = {
    //         data: financialData,
    //         budgetCategoryId: financial_item.budgetCategoryId,
    //         budgetCategoryType: financial_item.budgetCategoryType,
    //     };

    //     await this.updateFinancialQuarterItem(
    //         userPayload,
    //         financialItemId,
    //         first_financial_quarter.id,
    //         updateFinancialQuarterItemDto,
    //         language,
    //     );
    // }

    public async getFinancialItemById(
        userPayload: UserPayloadDto,
        financialItemId: number,
        language: string,
    ): Promise<CreatedFinancialItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: ["item", "company", "budgetCategory"],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        return this.createdFinancialItemMapper.fromEntityToDTO(CreatedFinancialItemDto, financialItem);
    }

    public async createFinancialItem(
        userPayload: UserPayloadDto,
        createFinancialItemDto: CreateFinancialItemDto,
        item: ItemEntity,
        language: string,
    ): Promise<CreatedFinancialItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const companyPlanDates = await this.companyService.getCompanyPlanDates(userPayload, language);
            if (!companyPlanDates || !companyPlanDates.financialStartDate || !companyPlanDates.financialEndDate) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const newFinancialItem = new FinancialItemEntity();
            newFinancialItem.item = item;

            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            newFinancialItem.company = userCompany;

            const budgetCategory = await this.budgetCategoryService.getBudgetCategoryByType(
                createFinancialItemDto.budgetCategoryType,
            );
            newFinancialItem.budgetCategory = budgetCategory;

            const createdFinancialItemEntity: FinancialItemEntity = await this.financialItemRepository.save(
                newFinancialItem,
            );

            const companyPlan = await this.companyService.getCompanyPlanEntity(userCompany.id, language);
            // let's get the Financial Quarter Ratio entities
            const financialQuarterRatios = await this.getFinancialQuarterRatioEntities(
                userCompany,
                companyPlan.financialStartDate,
                companyPlan.financialEndDate,
            );

            // create financial Quarters
            const startDate = companyPlan.financialStartDate;
            const endDate = companyPlan.financialEndDate;
            const quartersList: FinancialQuarterEntity[] = [];
            let order = 1;
            let quarterNumber = 1;
            let index = 0;
            while (startDate <= endDate) {
                const financialQuarterEntity = new FinancialQuarterEntity();
                financialQuarterEntity.displayOrder = order;
                financialQuarterEntity.financialItem = createdFinancialItemEntity;
                financialQuarterEntity.value = 0;
                financialQuarterEntity.quarterNumber = quarterNumber;
                financialQuarterEntity.quarterDate = new Date(startDate);
                financialQuarterEntity.categoryType = budgetCategory.type;
                financialQuarterEntity.financialQuarterRatio = financialQuarterRatios[index];
                order += 1;
                quarterNumber += 1;
                if (quarterNumber === 5) {
                    quarterNumber = 1;
                }
                quartersList.push(financialQuarterEntity);
                startDate.setMonth(startDate.getMonth() + 3);
                index += 1;
            }
            const createdQuartersList = await this.financialQuarterRepository.save(quartersList);

            // add financial Item data (DirectCostsItemDto, RevenueItemDto or OtherItemsDto)
            if (createFinancialItemDto.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
                const created = await this.financialItemDirectCostService.createFinancialDirectCost(
                    userPayload,
                    userCompany,
                    createdQuartersList,
                    createdFinancialItemEntity,
                    createFinancialItemDto.data as FinancialDirectCostsItemDto,
                    language,
                );
                console.log(created);
            } else if (createFinancialItemDto.budgetCategoryType === BudgetCategory.REVENUE) {
                const created = await this.financialItemRevenueService.createFinancialRevenue(
                    userPayload,
                    userCompany,
                    createdQuartersList,
                    createdFinancialItemEntity,
                    createFinancialItemDto.data as FinancialRevenueItemDto,
                    language,
                );
                console.log(created);
            } else if (
                createFinancialItemDto.budgetCategoryType === BudgetCategory.OPERATING_EXPENSES ||
                createFinancialItemDto.budgetCategoryType === BudgetCategory.PERSONNEL_COSTS
            ) {
                const created = await this.financialItemManualCostService.createFinancialManual(
                    userPayload,
                    userCompany,
                    createdQuartersList,
                    createdFinancialItemEntity,
                    createFinancialItemDto.data as FinancialOtherItemsDto,
                    language,
                );
                console.log(created);
            } else {
                throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
            }

            return this.createdFinancialItemMapper.fromEntityToDTO(CreatedFinancialItemDto, newFinancialItem);
        } catch (e) {
            console.log(`Can't create financial item: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(FinancialItemKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async getFinancialQuarterRatioEntities(
        company: CompanyEntity,
        financialStartDate: Date,
        financialEndDate: Date,
    ): Promise<FinancialQuarterRatioEntity[]> {
        const quarterRatios = await this.financialQuarterRatioRepository.find({
            where: {
                company: company,
            },
            relations: ["company"],
            order: {
                quarterDate: "ASC",
            },
        });

        if (quarterRatios && quarterRatios.length > 0) {
            // the company has Quarter Ratios
            return quarterRatios;
        }

        // create Financial Quarter Ratios Entities
        financialStartDate = new Date(financialStartDate);
        financialEndDate = new Date(financialEndDate);
        let quarterNumber = 1;
        const listToSave: FinancialQuarterRatioEntity[] = [];
        while (financialStartDate <= financialEndDate) {
            const financialQuarterRatioEntity = new FinancialQuarterRatioEntity();
            financialQuarterRatioEntity.quarterDate = new Date(financialStartDate);
            financialQuarterRatioEntity.company = company;
            financialQuarterRatioEntity.quarterNumber = quarterNumber;

            quarterNumber += 1;
            if (quarterNumber === 5) {
                quarterNumber = 1;
            }

            listToSave.push(financialQuarterRatioEntity);

            financialStartDate.setMonth(financialStartDate.getMonth() + 3);
        }

        const createdFinancialRatiosList = await this.financialQuarterRatioRepository.save(listToSave);

        return createdFinancialRatiosList;
    }

    async updateFinancialItem(
        userPayload: UserPayloadDto,
        financialItemId: number,
        updateFinancialItemDto: UpdateFinancialItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: ["company", "budgetCategory", "item"],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        financialItem.item.name = updateFinancialItemDto.name;
        financialItem.item.description = updateFinancialItemDto.description;
        await this.financialItemRepository.save(financialItem);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(FinancialItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteFinancialItem(
        userPayload: UserPayloadDto,
        financialItemId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: [
                "item",
                "company",
                "budgetCategory",
                "financialQuarters",
                "financialQuarters.financialQuarterRatio",
                "financialQuarters.financialItemDirectCostDependencies",
                "financialQuarters.financialItemDirectCostDependencies.financialItem",
                "financialQuarters.financialItemDirectCostDependencies.financialItem.item",
            ],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const deletedQuartersSet: Set<FinancialQuarterEntity> = new Set();
        if (financialItem.financialQuarters) {
            const directCostSet = new Set();
            for (const quarter of financialItem.financialQuarters) {
                if (
                    quarter &&
                    quarter.financialItemDirectCostDependencies &&
                    quarter.financialItemDirectCostDependencies.length > 0
                ) {
                    quarter.financialItemDirectCostDependencies.forEach((e) => directCostSet.add(e.financialItem.item.name));
                }
                deletedQuartersSet.add(quarter);
            }
            if (directCostSet.size > 0) {
                throw new HttpException(
                    {
                        message: `This financial item is being used in some direct cost items. Remove it from those [${[
                            ...directCostSet,
                        ].join(" ")}] direct cost items before deleting it.`,
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        await this.financialItemRepository.delete(financialItemId);

        await this.financialSharedService.updateQuarterRatiosAfterDeletingQuarters(
            userCompany.id,
            deletedQuartersSet,
            language,
        );

        return {
            isSuccessful: true,
            message: await this.i18n.translate(FinancialItemKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async updateFinancialQuarterItem(
        userPayload: UserPayloadDto,
        financialItemId: number,
        financialQuarterItemId: number,
        updateFinancialQuarterItemDto: UpdateFinancialQuarterItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const quarterItem = await this.financialQuarterRepository.findOne(financialQuarterItemId, {
            relations: [
                "financialItem",
                "financialItemRevenues",
                "financialItemRevenues.financialItemRevenueFutureGrowth",
                "financialItemDirectCosts",
                "financialItemDirectCostDependencies",
                "financialItemDirectCostDependencies.financialQuarter",
                "financialItemManualCosts",
            ],
        });

        // check that category is matching data
        if (!quarterItem || quarterItem.financialItem.id !== financialItemId) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialQuarterKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (financialItem.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
            const updated = await this.financialItemDirectCostService.updateFinancialDirectCostQuarter(
                userPayload,
                userCompany,
                quarterItem,
                financialItem,
                updateFinancialQuarterItemDto.data as FinancialDirectCostsItemDto,
                language,
            );
            console.log(updated);
        } else if (financialItem.budgetCategory.type === BudgetCategory.REVENUE) {
            const updated = await this.financialItemRevenueService.updateFinancialRevenueQuarter(
                userPayload,
                userCompany,
                quarterItem,
                financialItem,
                updateFinancialQuarterItemDto.data as FinancialRevenueItemDto,
                language,
            );
            console.log(updated);
        } else if (
            financialItem.budgetCategory.type === BudgetCategory.OPERATING_EXPENSES ||
            financialItem.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS
        ) {
            const updated = await this.financialItemManualCostService.updateFinancialManualQuarter(
                userPayload,
                userCompany,
                quarterItem,
                financialItem,
                updateFinancialQuarterItemDto.data as FinancialOtherItemsDto,
                language,
            );
            console.log(updated);
        } else {
            throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(FinancialItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getFirstQuarterByFinancialItemId(financialItemId: number): Promise<FinancialQuarterEntity> {
        return await this.financialQuarterRepository.findOne({
            where: {
                financialItem: { id: financialItemId },
            },
            order: { quarterDate: "ASC" },
        });
    }

    public async getFinancialQuarterItemById(
        userPayload: UserPayloadDto,
        financialItemId: number,
        financialQuarterItemId: number,
        language: string,
    ): Promise<FinancialQuarterItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!financialItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (financialItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const quarter = await this.financialQuarterRepository.findOne(financialQuarterItemId, {
            where: {
                financialItem: financialItem,
            },
            relations: [
                "financialItem",
                "financialItem.item",
                "financialItem.budgetCategory",
                "financialItemRevenues",
                "financialItemRevenues.financialItemRevenueFutureGrowth",
                "financialItemRevenues.revenueItem",
                "financialItemRevenues.revenueItem.revenueModel",
                "financialItemDirectCosts",
                "financialItemDirectCosts.percentageFromFinancialQuarter",
                "financialItemDirectCosts.percentageFromFinancialQuarter.financialItem",
                "financialItemManualCosts",
            ],
        });

        if (!quarter) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(FinancialQuarterKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.financialQuarterItemMapper.fromEntityToDTO(FinancialQuarterItemDto, quarter);
    }

    public async getUserCompanyFinancialQuarterRatios(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<FinancialQuarterRatioEntity[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        return this.getCompanyFinancialQuarterRatios(userCompany.id, language);
    }

    public async getCompanyFinancialQuarterRatios(
        companyId: number,
        language: string,
    ): Promise<FinancialQuarterRatioEntity[]> {
        const quarterRatios = await this.financialQuarterRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: { id: companyId },
            },
            order: {
                quarterDate: "ASC",
            },
        });

        return quarterRatios ? quarterRatios : [];
    }

    public async getUserCompanyFinancialItems(
        userPayload: UserPayloadDto,
        budgetCategory: BudgetCategory,
        language: string,
    ): Promise<FinancialItemEntity[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        return this.getCompanyFinancialItems(userCompany.id, budgetCategory, language);
    }

    public async getCompanyFinancialItems(
        companyId: number,
        budgetCategory: BudgetCategory,
        language: string,
    ): Promise<FinancialItemEntity[]> {
        const financialItems: FinancialItemEntity[] = await this.financialItemRepository.find({
            relations: [
                "company",
                "company.user",
                "budgetCategory",
                "financialItemRevenues",
                "financialItemRevenues.financialQuarter",
                "financialItemRevenues.revenueItem",
                "financialItemRevenues.revenueItem.revenueModel",
                "financialItemManualCosts",
            ],
            where: {
                company: { id: companyId },
                budgetCategory: { type: budgetCategory },

            },
        });

        if (financialItems) {
            financialItems.forEach((item) => {
                item.financialItemRevenues.sort((a, b) => {
                    const dateA = new Date(a.financialQuarter.quarterDate);
                    const dateB = new Date(b.financialQuarter.quarterDate);
                    return dateA.getTime() - dateB.getTime();
                });
            });
        }

        return financialItems ? financialItems : [];
    }
}
