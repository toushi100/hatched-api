import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CompanyService } from "../../company/services/company.service";
import { QueueEventService } from "../../../modules/queueEvent/queue-event.service";
import { ActualBudgetItemRepository } from "../repositories/actual-budget-item.repository";
import { ActualBudgetMonthRatioRepository } from "../repositories/actual-budget-month-ratio.repository";
import { ActualBudgetMonthEntity } from "../entities/actual-budget-month.entity";
import { UpdateActualBudgetItemDto } from "../dto/request/update_actual_budget_item.dto";
import { UserPayloadDto } from "../../../modules/core/user/dto/user-payload.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { languagesCodes } from "src/constants/languages";
import { ActualBudgetMonthRepository } from "../repositories/actual-budget-month.repository";
import { ActualBudgetItemKeys, ActualBudgetMonthKeys } from "../translate.enum";
import { ProfitLossSharedService } from "./profit-loss-shared.service";
import { ItemEntity } from "src/modules/company/entities/item.entity";
import { CreateActualBudgetItemDto } from "../dto/request/create_actual_budget_item.dto";
import { CompanyKeys } from "src/modules/company/translate.enum";
import { ActualBudgetItemEntity } from "../entities/actual-budget-item.entity";
import { BudgetCategoryService } from "src/modules/budget/budget-category/budget-category.service";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { ActualBudgetMonthRatioEntity } from "../entities/actual-budget-month-ratio.entity";
import { Equal } from "typeorm";
import { ActualBudgetMonthDto } from "../dto/response/actual_budget_month.dto";
import { ActualBudgetItemDto } from "../dto/response/actual_budget_item.dto";
import { UpdateActualBudgetMonthItemDto } from "../dto/request/update_actual_budget_month_item.dto";
import { ActualBudgetMonthItemDto } from "../dto/response/actual_budget_month_item.dto";
import { ActualBudgetItemsListDto } from "../dto/response/actual_budget_items_list.dto";
import { ActualBudgetItemsListMapper } from "../mapper/actual_budget_items_list.mapper";
import { BudgetItemService } from "src/modules/budget/budget-item/services/budget-item.service";
import { BudgetItemsListDto } from "src/modules/budget/budget-item/dto/response/budget_items_list.dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";

@Injectable()
export class ProfitLossService {
    constructor(
        public readonly actualBudgetItemRepository: ActualBudgetItemRepository,
        public readonly actualBudgetMonthRatioRepository: ActualBudgetMonthRatioRepository,
        public readonly actualBudgetMonthRepository: ActualBudgetMonthRepository,
        public readonly budgetCategoryService: BudgetCategoryService,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly profitLossSharedService: ProfitLossSharedService,
        @Inject(forwardRef(() => QueueEventService))
        public readonly queueEventService: QueueEventService,
        public readonly actualBudgetItemsListMapper: ActualBudgetItemsListMapper,
        @Inject(forwardRef(() => BudgetItemService))
        public readonly budgetItemService: BudgetItemService,
    ) { }

    public async getOneActualBudgetMonth(
        userPayload: UserPayloadDto,
        actualBudgetItemId: number,
        actualBudgetMonthItemId: number,
        language: string,
    ): Promise<ActualBudgetMonthItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const actualBudgetItem = await this.actualBudgetItemRepository.findOne(actualBudgetItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!actualBudgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (actualBudgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const monthItem = await this.actualBudgetMonthRepository.findOne(actualBudgetMonthItemId, {
            relations: [
                "actualBudgetItem",
            ],
        });

        // check that category is matching data
        if (!monthItem || monthItem.actualBudgetItem.id !== actualBudgetMonthItemId) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetMonthKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return {
            value: monthItem.value,
        };
    }

    public async updateOneActualBudgetMonth(
        userPayload: UserPayloadDto,
        actualBudgetItemId: number,
        actualBudgetMonthItemId: number,
        updateActualBudgetMonthItemDto: UpdateActualBudgetMonthItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const actualBudgetItem = await this.actualBudgetItemRepository.findOne(actualBudgetItemId, {
            relations: ["company", "budgetCategory"],
        });

        if (!actualBudgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (actualBudgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const monthItem = await this.actualBudgetMonthRepository.findOne(actualBudgetMonthItemId, {
            relations: [
                "actualBudgetItem",
            ],
        });

        // check that category is matching data
        if (!monthItem || monthItem.actualBudgetItem.id !== actualBudgetItemId) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetMonthKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        monthItem.value = updateActualBudgetMonthItemDto.value;

        await this.actualBudgetMonthRepository.save(monthItem);

        updatedMonthSetIds.add(monthItem.id);

        await this.profitLossSharedService.updateMonthRatios(userCompany.id, updatedMonthSetIds, language);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(ActualBudgetItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getActualBudgetMonths(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<ActualBudgetMonthDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const monthRatios = await this.actualBudgetMonthRatioRepository.find({
                where: {
                    company: userCompany,
                },
                relations: ["company"],
                order: {
                    monthDate: "ASC",
                },
            });

            const actualBudgetMonthList: ActualBudgetMonthDto[] = [];
            if (monthRatios) {
                monthRatios.forEach(item => actualBudgetMonthList.push({
                    monthDate: item.monthDate,
                }));
            }

            return actualBudgetMonthList;
        } catch (e) {
            console.log(`Can't get Actual Budget Months: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ActualBudgetItemKeys.GET_Months_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getActualBudgetItems(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<ActualBudgetItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const actualBudgetItems = await this.actualBudgetItemRepository.find({
                where: {
                    company: userCompany,
                },
                order: {
                    createdAt: "ASC",
                },
                relations: ["company", "budgetCategory", "item"],
            });

            const actualBudgetItemList: ActualBudgetItemDto[] = [];
            if (actualBudgetItems) {
                // sort by the category and budget item date
                const getBudgetCategoryValue = (budgetCategory: BudgetCategory) => {
                    if (budgetCategory === BudgetCategory.REVENUE) return 0;
                    if (budgetCategory === BudgetCategory.DIRECT_COSTS) return 1;
                    if (budgetCategory === BudgetCategory.PERSONNEL_COSTS) return 2;
                    return 3;
                };
                actualBudgetItems.sort((a, b) => {
                    return getBudgetCategoryValue(a.budgetCategory.type) - getBudgetCategoryValue(b.budgetCategory.type) || a.id - b.id;
                });

                actualBudgetItems.forEach(actualBudget => actualBudgetItemList.push({
                    actualBudgetItemId: actualBudget.id,
                    name: actualBudget.item.name,
                    budgetCategoryId: actualBudget.budgetCategory.id,
                    budgetCategoryType: actualBudget.budgetCategory.type,
                }));
            }

            return actualBudgetItemList;
        } catch (e) {
            console.log(`Can't get Actual Budget Months: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ActualBudgetItemKeys.GET_Months_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async deleteActualBudgetItem(
        userPayload: UserPayloadDto,
        actualBudgetItemId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const actualBudgetItem = await this.actualBudgetItemRepository.findOne(actualBudgetItemId, {
            relations: [
                "item",
                "item.budgetItem",
                "company",
                "budgetCategory",
                "actualBudgetMonths",
                "actualBudgetMonths.actualBudgetMonthRatio",
            ],
        });

        if (!actualBudgetItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (actualBudgetItem.company.id !== userCompany.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(ActualBudgetItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const deletedMonthsSet: Set<ActualBudgetMonthEntity> = new Set();
        if (actualBudgetItem.actualBudgetMonths) {
            for (const month of actualBudgetItem.actualBudgetMonths) {
                deletedMonthsSet.add(month);
            }
        }

        await this.actualBudgetItemRepository.delete(actualBudgetItemId);

        await this.profitLossSharedService.updateMonthRatiosAfterDeletingMonths(userCompany.id, deletedMonthsSet, language);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(ActualBudgetItemKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async createActualBudgetItem(
        userPayload: UserPayloadDto,
        createActualBudgetItemDto: CreateActualBudgetItemDto,
        item: ItemEntity,
        language: string,
    ): Promise<void> {
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

            const newBudgetItem = new ActualBudgetItemEntity();
            newBudgetItem.item = item;
            newBudgetItem.company = userCompany;

            const budgetCategory = await this.budgetCategoryService.getBudgetCategoryByType(
                createActualBudgetItemDto.budgetCategoryType,
            );
            newBudgetItem.budgetCategory = budgetCategory;

            const createdActualBudgetItemEntity: ActualBudgetItemEntity = await this.actualBudgetItemRepository.save(newBudgetItem);

            const companyPlan = await this.companyService.getCompanyPlanEntity(userCompany.id, language);
            // let's get the Actual Budget Month Ratio entities
            const actualBudgetMonthRatios = await this.getActualBudgetMonthRatioEntities(
                userCompany,
                companyPlan.budgetStartDate,
                companyPlan.budgetEndDate,
            );

            // create actual budget Months
            const startDate = companyPlan.budgetStartDate;
            const endDate = companyPlan.budgetEndDate;
            const monthsList: ActualBudgetMonthEntity[] = [];
            let order = 1;
            let monthNumber = 1;
            let index = 0;
            while (startDate <= endDate) {
                const budgetMonthEntity = new ActualBudgetMonthEntity();
                budgetMonthEntity.displayOrder = order;
                budgetMonthEntity.actualBudgetItem = createdActualBudgetItemEntity;
                budgetMonthEntity.value = 0;
                budgetMonthEntity.monthNumber = monthNumber;
                budgetMonthEntity.monthDate = new Date(startDate);
                budgetMonthEntity.categoryType = budgetCategory.type;
                budgetMonthEntity.actualBudgetMonthRatio = actualBudgetMonthRatios[index];
                order += 1;
                monthNumber += 1;
                monthsList.push(budgetMonthEntity);
                startDate.setMonth(startDate.getMonth() + 1);
                index += 1;
            }
            const createdMonthsList = await this.actualBudgetMonthRepository.save(monthsList);

        } catch (e) {
            console.log(`Can't create actual budget item: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ActualBudgetItemKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async updateActualBudgetMonthItem(
        userPayload: UserPayloadDto,
        updateActualBudgetItemDto: UpdateActualBudgetItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        const actualBudgetMonthDate: Date = updateActualBudgetItemDto.actualBudgetItemMonthDate;
        const actualBudgetMonthList: ActualBudgetMonthEntity[] = await this.actualBudgetMonthRepository.find({
            relations: ["actualBudgetItem", "actualBudgetItem.company"],
            where: {
                monthDate: Equal(actualBudgetMonthDate),
                actualBudgetItem: {
                    company: userCompany,
                }
            },
        });

        console.log(actualBudgetMonthList);

        for (const [key, _] of Object.entries(updateActualBudgetItemDto.data)) {
            const actualBudgetItemId: number = parseInt(key); // Convert key to a number
            const found = actualBudgetMonthList.find(actualBudgetMonth => actualBudgetMonth.actualBudgetItem && actualBudgetMonth.actualBudgetItem.id === actualBudgetItemId);

            if (!found) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(ActualBudgetItemKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
        }

        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        // reset the all values
        actualBudgetMonthList.forEach(actualBudgetMonth => {
            actualBudgetMonth.value = 0;
            updatedMonthSetIds.add(actualBudgetMonth.id);
        });

        // update the month values with the new values
        for (const [key, value] of Object.entries(updateActualBudgetItemDto.data)) {
            const actualBudgetItemId: number = parseInt(key); // Convert key to a number
            const found = actualBudgetMonthList.find(actualBudgetMonth => actualBudgetMonth.actualBudgetItem && actualBudgetMonth.actualBudgetItem.id === actualBudgetItemId);

            found.value = value;
        }

        await this.actualBudgetMonthRepository.save(actualBudgetMonthList);

        await this.profitLossSharedService.updateMonthRatios(userCompany.id, updatedMonthSetIds, language);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(ActualBudgetItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getActualBudgetMonthRatioEntities(
        company: CompanyEntity,
        budgetStartDate: Date,
        budgetEndDate: Date,
    ): Promise<ActualBudgetMonthRatioEntity[]> {
        const monthRatios = await this.actualBudgetMonthRatioRepository.find({
            where: {
                company: company,
            },
            order: {
                monthDate: "ASC",
            },
            relations: ["company"],
        });

        if (monthRatios && monthRatios.length > 0) {
            // the company has Month Ratios
            return monthRatios;
        }

        // create Actual Budget Month Ratios Entities
        budgetStartDate = new Date(budgetStartDate);
        budgetEndDate = new Date(budgetEndDate);
        const monthNumber = 1;
        const listToSave: ActualBudgetMonthRatioEntity[] = [];
        while (budgetStartDate <= budgetEndDate) {
            const actualBudgetMonthRatioEntity = new ActualBudgetMonthRatioEntity();
            actualBudgetMonthRatioEntity.monthDate = new Date(budgetStartDate);
            actualBudgetMonthRatioEntity.company = company;
            actualBudgetMonthRatioEntity.monthNumber = monthNumber;

            listToSave.push(actualBudgetMonthRatioEntity);

            budgetStartDate.setMonth(budgetStartDate.getMonth() + 1);
        }

        const createdActualBudgetRatiosList = await this.actualBudgetMonthRatioRepository.save(listToSave);

        return createdActualBudgetRatiosList;
    }

    public async getActualBudgetItemsTableData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<ActualBudgetItemsListDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        return this.getActualBudgetItemsTableDataByCompany(userCompany, language);
    }

    public async getActualBudgetItemsTableDataByCompany(
        company: CompanyEntity,
        language: string,
    ): Promise<ActualBudgetItemsListDto> {
        const dbBudgetItems = await this.actualBudgetItemRepository.find({
            relations: ["item", "company", "company.user", "budgetCategory", "actualBudgetMonths"],
            where: { company: company },
            order: {
                createdAt: "ASC",
            },
        });

        const monthRatios = await this.actualBudgetMonthRatioRepository.find({
            relations: ["company", "company.user"],
            where: {
                company: company,
            },
            order: {
                monthDate: "ASC",
            },
        });

        const budgetItemsListDto: BudgetItemsListDto = await this.budgetItemService.getBudgetItemsByCompany(company);

        return this.actualBudgetItemsListMapper.fromEntityToDTO(ActualBudgetItemsListDto, dbBudgetItems, monthRatios, budgetItemsListDto);
    }
}
