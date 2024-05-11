import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../../constants/languages";
import { BudgetItemKeys, BudgetMonthKeys } from "../translate.enum";
import { BudgetItemRepository } from "../repositories/budget-item.repository";
import { CreateBudgetItemDto } from "../dto/request/create_budget_item.dto";
import { CreatedBudgetItemMapper } from "../mapper/created_budget_item.mapper";
import { BudgetItemsListMapper } from "../mapper/budget_items_list.mapper";
import { CreatedBudgetItemDto } from "../dto/response/created_budget_item.dto";
import { BudgetItemsListDto } from "../dto/response/budget_items_list.dto";
import { UpdateBudgetMonthItemDto } from "../dto/request/update_budget_month_item.dto";
import { BasicOperationsResponse } from "../../../../common/dto/basic-operations-response.dto";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { BudgetCategoryService } from "../../budget-category/budget-category.service";
import { UserPayloadDto } from "../../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../../company/services/company.service";
import { BudgetMonthRepository } from "../repositories/budget-month.repository";
import { BudgetMonthItemMapper } from "../mapper/budget_month_item.mapper";
import { BudgetMonthRatioRepository } from "../repositories/budget-month-ratio.repository";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { BudgetCategory } from "../../budget-category/types/budget_category.enum";
import { BudgetDirectCostsItemDto } from "../dto/request/direct_cost_data.dto";
import { BudgetRevenueItemDto } from "../dto/request/revenue_data.dto";
import { BudgetOtherItemsDto } from "../dto/request/other_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { BudgetMonthRatioEntity } from "../entities/budget-month-ratio.entity";
import { UpdateBudgetItemDto } from "../dto/request/update_budget_item.dto";
import { BudgetMonthItemDto } from "../dto/response/budget_month_item.dto";
import { BudgetItemDirectCostService } from "./budget-item-direct-cost.service";
import { BudgetItemManualCostService } from "./budget-item-manual-cost.service";
import { BudgetItemRevenueService } from "./budget-item-revenue.service";
import { BudgetSharedService } from "./budget-shared.service";
import { ItemEntity } from "src/modules/company/entities/item.entity";
import { ItemDto } from "src/modules/company/types/Item";
import { QueueEventService } from "src/modules/queueEvent/queue-event.service";
import { CompanyKeys } from "src/modules/company/translate.enum";

@Injectable()
export class BudgetItemService {
    constructor(
        public readonly budgetItemRepository: BudgetItemRepository,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        public readonly budgetCategoryService: BudgetCategoryService,
        public readonly createdBudgetItemMapper: CreatedBudgetItemMapper,
        public readonly budgetItemsListMapper: BudgetItemsListMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly budgetItemDirectCostService: BudgetItemDirectCostService,
        public readonly budgetItemManualCostService: BudgetItemManualCostService,
        public readonly budgetItemRevenueService: BudgetItemRevenueService,
        public readonly budgetMonthItemMapper: BudgetMonthItemMapper,
        public readonly budgetMonthRatioRepository: BudgetMonthRatioRepository,
        public readonly budgetSharedService: BudgetSharedService,
        @Inject(forwardRef(() => QueueEventService))
        public readonly queueEventService: QueueEventService,
    ) { }

    public async getBudgetItemsByCompany(company: CompanyEntity): Promise<BudgetItemsListDto> {
        const dbBudgetItems = await this.budgetItemRepository.find({
            relations: ["item", "company", "company.user", "budgetCategory", "budgetMonths"],
            where: { company: company },
            order: {
                createdAt: "ASC",
            },
        });

        const monthRatios = await this.budgetMonthRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: company,
            },
            order: {
                monthDate: "ASC",
            },
        });

        return this.budgetItemsListMapper.fromEntityToDTO(BudgetItemsListDto, dbBudgetItems, monthRatios);
    }

    public async getBudgetItems(userPayload: UserPayloadDto): Promise<BudgetItemsListDto> {
        const dbBudgetItems = await this.budgetItemRepository.find({
            relations: ["item", "company", "company.user", "budgetCategory", "budgetMonths"],
            where: { company: { user: { id: userPayload.id } } },
            order: {
                createdAt: "ASC",
            },
        });

        const monthRatios = await this.budgetMonthRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: { user: { id: userPayload.id } },
            },
            order: {
                monthDate: "ASC",
            },
        });

        return this.budgetItemsListMapper.fromEntityToDTO(BudgetItemsListDto, dbBudgetItems, monthRatios);
    }

    // async updateBudgetItemByEmployeeListener(
    //     userPayload: UserPayloadDto,
    //     budgetItemId: number,
    //     startDate: Date,
    //     endDate: Date,
    //     monthlySalary: number,
    //     language: string,
    // ): Promise<void> {
    //     const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
    //         relations: [
    //             "company",
    //             "budgetCategory",
    //             "budgetMonths",
    //             "budgetMonths.budgetMonthRatio",
    //             "budgetMonths.budgetItemDirectCostDependencies",
    //             "budgetMonths.budgetItemDirectCostDependencies.budgetItem",
    //         ],
    //     });

    //     for (const month of budgetItem.budgetMonths) {
    //         const financialData: BudgetOtherItemsDto = {
    //             amount: month.value + monthlySalary,
    //             expectedMonthlyGrowth: 0,
    //         };
    //         const updateBudgetMonthItemDto: UpdateBudgetMonthItemDto = {
    //             data: financialData,
    //             budgetCategoryId: budgetItem.budgetCategory.id,
    //             budgetCategoryType: budgetItem.budgetCategory.type,
    //         };

    //         await this.updateBudgetMonthItem(userPayload, budgetItemId, month.id, updateBudgetMonthItemDto, language);
    //     }
    // }

    public async getBudgetItemById(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        language: string,
    ): Promise<CreatedBudgetItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["item", "company", "budgetCategory"],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        return this.createdBudgetItemMapper.fromEntityToDTO(CreatedBudgetItemDto, budgetItem);
    }

    public async createBudgetItem(
        userPayload: UserPayloadDto,
        createBudgetItemDto: CreateBudgetItemDto,
        language: string,
    ): Promise<CreatedBudgetItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const companyPlanDates = await this.companyService.getCompanyPlanDates(userPayload, language);

            if (!companyPlanDates || !companyPlanDates.budgetStartDate || !companyPlanDates.budgetEndDate) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CompanyKeys.PLAN_DATES_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            // first create item record
            const itemDto: ItemDto = {
                name: createBudgetItemDto.name,
                description: createBudgetItemDto.description,
            };
            const createdItem = await this.companyService.createCompanyItem(userCompany.id, itemDto, language);

            const newBudgetItem = new BudgetItemEntity();
            newBudgetItem.item = createdItem;
            newBudgetItem.company = userCompany;

            const budgetCategory = await this.budgetCategoryService.getBudgetCategoryByType(
                createBudgetItemDto.budgetCategoryType,
            );
            newBudgetItem.budgetCategory = budgetCategory;

            const createdBudgetItemEntity: BudgetItemEntity = await this.budgetItemRepository.save(newBudgetItem);

            const companyPlan = await this.companyService.getCompanyPlanEntity(userCompany.id, language);
            // let's get the Budget Month Ratio entities
            const budgetMonthRatios = await this.getBudgetMonthRatioEntities(
                userCompany,
                companyPlan.budgetStartDate,
                companyPlan.budgetEndDate,
            );

            // create budget Months
            const startDate = companyPlan.budgetStartDate;
            const endDate = companyPlan.budgetEndDate;
            const monthsList: BudgetMonthEntity[] = [];
            let order = 1;
            let monthNumber = 1;
            let index = 0;
            while (startDate <= endDate) {
                const budgetMonthEntity = new BudgetMonthEntity();
                budgetMonthEntity.displayOrder = order;
                budgetMonthEntity.budgetItem = createdBudgetItemEntity;
                budgetMonthEntity.value = 0;
                budgetMonthEntity.monthNumber = monthNumber;
                budgetMonthEntity.monthDate = new Date(startDate);
                budgetMonthEntity.categoryType = budgetCategory.type;
                budgetMonthEntity.budgetMonthRatio = budgetMonthRatios[index];
                order += 1;
                monthNumber += 1;
                monthsList.push(budgetMonthEntity);
                startDate.setMonth(startDate.getMonth() + 1);
                index += 1;
            }
            const createdMonthsList = await this.budgetMonthRepository.save(monthsList);

            // add budget Item data (DirectCostsItemDto, RevenueItemDto or OtherItemsDto)
            if (createBudgetItemDto.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
                const created = await this.budgetItemDirectCostService.createBudgetDirectCost(
                    userPayload,
                    userCompany,
                    createdMonthsList,
                    createdBudgetItemEntity,
                    createBudgetItemDto.data as BudgetDirectCostsItemDto,
                    language,
                );
                console.log(created);
            } else if (createBudgetItemDto.budgetCategoryType === BudgetCategory.REVENUE) {
                const created = await this.budgetItemRevenueService.createBudgetRevenue(
                    userPayload,
                    userCompany,
                    createdMonthsList,
                    createdBudgetItemEntity,
                    createBudgetItemDto.data as BudgetRevenueItemDto,
                    language,
                );
                console.log(created);
            } else if (
                createBudgetItemDto.budgetCategoryType === BudgetCategory.OPERATING_EXPENSES ||
                createBudgetItemDto.budgetCategoryType === BudgetCategory.PERSONNEL_COSTS
            ) {
                const created = await this.budgetItemManualCostService.createBudgetManual(
                    userPayload,
                    userCompany,
                    createdMonthsList,
                    createdBudgetItemEntity,
                    createBudgetItemDto.data as BudgetOtherItemsDto,
                    language,
                );
                console.log(created);
            } else {
                throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
            }

            await this.queueEventService.handleBudgetItemCreatedEvent(userPayload, createBudgetItemDto,
                createdBudgetItemEntity, language);

            return this.createdBudgetItemMapper.fromEntityToDTO(CreatedBudgetItemDto, createdBudgetItemEntity);
        } catch (e) {
            console.log(`Can't create budget item: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(BudgetItemKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getBudgetMonthRatioEntities(
        company: CompanyEntity,
        budgetStartDate: Date,
        budgetEndDate: Date,
    ): Promise<BudgetMonthRatioEntity[]> {
        const monthRatios = await this.budgetMonthRatioRepository.find({
            where: {
                company: company,
            },
            relations: ["company"],
            order: {
                monthDate: "ASC",
            },
        });

        if (monthRatios && monthRatios.length > 0) {
            // the company has Month Ratios
            return monthRatios;
        }

        // create Budget Month Ratios Entities
        budgetStartDate = new Date(budgetStartDate);
        budgetEndDate = new Date(budgetEndDate);
        let monthNumber = 1;
        const listToSave: BudgetMonthRatioEntity[] = [];
        while (budgetStartDate <= budgetEndDate) {
            const budgetMonthRatioEntity = new BudgetMonthRatioEntity();
            budgetMonthRatioEntity.monthDate = new Date(budgetStartDate);
            budgetMonthRatioEntity.company = company;
            budgetMonthRatioEntity.monthNumber = monthNumber;

            listToSave.push(budgetMonthRatioEntity);

            budgetStartDate.setMonth(budgetStartDate.getMonth() + 1);
            monthNumber += 1;
        }

        const createdBudgetRatiosList = await this.budgetMonthRatioRepository.save(listToSave);

        return createdBudgetRatiosList;
    }

    public async updateBudgetItem(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        updateBudgetItemDto: UpdateBudgetItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["company", "budgetCategory", "item"],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        budgetItem.item.name = updateBudgetItemDto.name;
        budgetItem.item.description = updateBudgetItemDto.description;
        await this.budgetItemRepository.save(budgetItem);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(BudgetItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async deleteBudgetItem(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: [
                "item",
                "item.financialItem",
                "item.actualBudgetItem",
                "item.budgetItem",
                "company",
                "budgetCategory",
                "budgetMonths",
                "budgetMonths.budgetMonthRatio",
                "budgetMonths.budgetItemDirectCostDependencies",
                "budgetMonths.budgetItemDirectCostDependencies.budgetItem",
                "budgetMonths.budgetItemDirectCostDependencies.budgetItem.item",
            ],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const deletedMonthsSet: Set<BudgetMonthEntity> = new Set();
        if (budgetItem.budgetMonths) {
            const directCostSet = new Set();
            for (const month of budgetItem.budgetMonths) {
                if (
                    month &&
                    month.budgetItemDirectCostDependencies &&
                    month.budgetItemDirectCostDependencies.length > 0
                ) {
                    month.budgetItemDirectCostDependencies.forEach((e) => directCostSet.add(e.budgetItem.item.name));
                }
                deletedMonthsSet.add(month);
            }
            if (directCostSet.size > 0) {
                throw new HttpException(
                    {
                        message: `This budget item is being used in some direct cost items. Remove it from those [${[
                            ...directCostSet,
                        ].join(" ")}] direct cost items before deleting it.`,
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        await this.budgetItemRepository.delete(budgetItemId);

        await this.budgetSharedService.updateMonthRatiosAfterDeletingMonths(userCompany.id, deletedMonthsSet, language);

        await this.queueEventService.handleBudgetItemDeleteEvent(userPayload, budgetItemId, budgetItem.item, language);
        return {
            isSuccessful: true,
            message: await this.i18n.translate(BudgetItemKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async updateBudgetMonthItem(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        budgetMonthItemId: number,
        updateBudgetMonthItemDto: UpdateBudgetMonthItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const monthItem = await this.budgetMonthRepository.findOne(budgetMonthItemId, {
            relations: [
                "budgetItem",
                "budgetItemRevenues",
                "budgetItemRevenues.budgetItemRevenueFutureGrowth",
                "budgetItemDirectCosts",
                "budgetItemDirectCostDependencies",
                "budgetItemDirectCostDependencies.budgetMonth",
                "budgetItemManualCosts",
            ],
        });
        // check that category is matching data
        if (!monthItem || monthItem.budgetItem.id !== budgetItemId) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetMonthKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (budgetItem.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
            const updated = await this.budgetItemDirectCostService.updateBudgetDirectCostMonth(
                userPayload,
                userCompany,
                monthItem,
                budgetItem,
                updateBudgetMonthItemDto.data as BudgetDirectCostsItemDto,
                language,
            );
            console.log(updated);
        } else if (budgetItem.budgetCategory.type === BudgetCategory.REVENUE) {
            const updated = await this.budgetItemRevenueService.updateBudgetRevenueMonth(
                userPayload,
                userCompany,
                monthItem,
                budgetItem,
                updateBudgetMonthItemDto.data as BudgetRevenueItemDto,
                language,
            );
            console.log(updated);
        } else if (
            budgetItem.budgetCategory.type === BudgetCategory.OPERATING_EXPENSES ||
            budgetItem.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS
        ) {
            const updated = await this.budgetItemManualCostService.updateBudgetManualMonth(
                userPayload,
                userCompany,
                monthItem,
                budgetItem,
                updateBudgetMonthItemDto.data as BudgetOtherItemsDto,
                language,
            );
            console.log(updated);
        } else {
            throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(BudgetItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async updatePersonnelCostsBudgetMonthItem(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        startDate: Date,
        endDate: Date,
        monthlySalary: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: [
                "company",
                "budgetCategory",
                "budgetMonths",
                "budgetMonths.budgetMonthRatio",
                "budgetMonths.budgetItemManualCosts",
            ],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (budgetItem.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS) {
            const updated = await this.budgetItemManualCostService.updatePersonnelCostsBudgetManual(
                userPayload,
                userCompany,
                budgetItem,
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
            message: await this.i18n.translate(BudgetItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getBudgetMonthItemById(
        userPayload: UserPayloadDto,
        budgetItemId: number,
        budgetMonthItemId: number,
        language: string,
    ): Promise<BudgetMonthItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!budgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (budgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const month = await this.budgetMonthRepository.findOne(budgetMonthItemId, {
            where: {
                budgetItem: budgetItem,
            },
            relations: [
                "budgetItem",
                "budgetItem.item",
                "budgetItem.budgetCategory",
                "budgetItemRevenues",
                "budgetItemRevenues.budgetItemRevenueFutureGrowth",
                "budgetItemRevenues.revenueItem",
                "budgetItemRevenues.revenueItem.revenueModel",
                "budgetItemDirectCosts",
                "budgetItemDirectCosts.percentageFromBudgetMonth",
                "budgetItemDirectCosts.percentageFromBudgetMonth.budgetItem",
                "budgetItemManualCosts",
            ],
        });

        if (!month) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(BudgetMonthKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.budgetMonthItemMapper.fromEntityToDTO(BudgetMonthItemDto, month);
    }

    public async getUserCompanyBudgetMonthRatios(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<BudgetMonthRatioEntity[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        return this.getCompanyBudgetMonthRatios(userCompany.id, language);
    }

    public async getCompanyBudgetMonthRatios(companyId: number, language: string): Promise<BudgetMonthRatioEntity[]> {
        const monthRatios = await this.budgetMonthRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: { id: companyId },
            },
            order: {
                monthDate: "ASC",
            },
        });

        return monthRatios ? monthRatios : [];
    }

    public async getUserCompanyBudgetItems(
        userPayload: UserPayloadDto,
        budgetCategory: BudgetCategory,
        language: string,
    ): Promise<BudgetItemEntity[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        return this.getCompanyBudgetItems(userCompany.id, budgetCategory, language);
    }

    public async getCompanyBudgetItems(
        companyId: number,
        budgetCategory: BudgetCategory,
        language: string,
    ): Promise<BudgetItemEntity[]> {
        const budgetItems: BudgetItemEntity[] = await this.budgetItemRepository.find({
            relations: [
                "company",
                "company.user",
                "budgetCategory",
                "budgetItemRevenues",
                "budgetItemRevenues.budgetMonth",
                "budgetItemRevenues.revenueItem",
                "budgetItemRevenues.revenueItem.revenueModel",
                "budgetItemManualCosts",
            ],
            where: {
                company: { id: companyId },
                budgetCategory: { type: budgetCategory },
            },
        });

        if (budgetItems) {
            budgetItems.forEach((item) => {
                item.budgetItemRevenues.sort((a, b) => {
                    const dateA = new Date(a.budgetMonth.monthDate);
                    const dateB = new Date(b.budgetMonth.monthDate);
                    return dateA.getTime() - dateB.getTime();
                });
            });
        }

        return budgetItems ? budgetItems : [];
    }
}
