import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../../constants/languages";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { UserPayloadDto } from "../../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../../company/services/company.service";
import { BudgetRevenueCurrentValueCalculation, BudgetRevenueFutureGrowth, BudgetRevenueItemDto, BudgetRevenueManualCurrentValue, BudgetRevenueManualFutureGrowth } from "../dto/request/revenue_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { RevenueModelService } from "src/modules/revenue-model/revenue-model.service";
import { RevenueModelAndItemKeys } from "src/modules/revenue-model/translate.enum";
import { BudgetItemRevenueFutureGrowthEntity } from "../entities/budget-item-revenue-future-growth.entity";
import { BudgetItemRevenueFutureGrowthRepository } from "../repositories/budget-item-revenue-future-growth.repository";
import { BudgetItemRevenueEntity } from "../entities/budget-item-revenue.entity";
import { RevenueItemEntity } from "src/modules/revenue-model/entities/revenue-item.entity";
import { BudgetItemRevenueRepository } from "../repositories/budget-item-revenue.repository";
import { BudgetMonthRepository } from "../repositories/budget-month.repository";
import { BudgetItemDirectCostEntity } from "../entities/budget-item-direct-cost.entity";
import { BudgetItemDirectCostRepository } from "../repositories/budget-item-direct-cost.repository";
import { Equal, In, MoreThan, MoreThanOrEqual } from "typeorm";
import { BudgetSharedService } from "./budget-shared.service";
import { BudgetItemManualCostService } from "./budget-item-manual-cost.service";
import { BudgetItemManualCostRepository } from "../repositories/budget-item-manual-cost.repository";

@Injectable()
export class BudgetItemRevenueService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly revenueModelService: RevenueModelService,
        public readonly budgetItemRevenueFutureGrowthRepository: BudgetItemRevenueFutureGrowthRepository,
        public readonly budgetItemRevenueRepository: BudgetItemRevenueRepository,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        public readonly budgetItemDirectCostRepository: BudgetItemDirectCostRepository,
        public readonly budgetSharedService: BudgetSharedService,
        public readonly budgetItemManualCostService: BudgetItemManualCostService,
        public readonly budgetItemManualCostRepository: BudgetItemManualCostRepository,
    ) { }

    public async createBudgetRevenue(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        monthsList: BudgetMonthEntity[],
        budgetItemEntity: BudgetItemEntity,
        revenueItemDto: BudgetRevenueItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        if (revenueItemDto.isManualInput) {
            const revenueManualData: BudgetRevenueManualCurrentValue =
                revenueItemDto.currentValue as BudgetRevenueManualCurrentValue;
            const revenueManualFutureGrowthData: BudgetRevenueManualFutureGrowth =
                revenueItemDto.futureGrowth as BudgetRevenueManualFutureGrowth;
            // call create manual
            const created = this.budgetItemManualCostService.createBudgetManual(
                userPayload,
                company,
                monthsList,
                budgetItemEntity,
                {
                    amount: revenueManualData.amount,
                    expectedMonthlyGrowth: revenueManualFutureGrowthData.expectedMonthlyGrowth,
                    applyOnlyMonth: revenueItemDto.applyOnlyMonth,
                },
                language,
            );
            return created;
        } else {
            const revenueCurrentValueCalculationData: BudgetRevenueCurrentValueCalculation[] =
                revenueItemDto.currentValue as BudgetRevenueCurrentValueCalculation[];

            const revenueFutureGrowthData: BudgetRevenueFutureGrowth =
                revenueItemDto.futureGrowth as BudgetRevenueFutureGrowth;

            // check that all revenueSourceIds exist
            for (let i = 0; i < revenueCurrentValueCalculationData.length; i++) {
                const budgetItemExist = await this.revenueModelService.isRevenueItemExist(
                    userPayload.id,
                    company.id,
                    revenueCurrentValueCalculationData[i].revenueSourceId,
                    language,
                );

                if (!budgetItemExist) {
                    throw new HttpException(
                        {
                            message: await this.i18n.translate(RevenueModelAndItemKeys.ITEM_NOT_FOUND, {
                                lang: languageCode,
                            }),
                        },
                        HttpStatus.NOT_FOUND,
                    );
                }
            }

            const applyOnlyMonth = !!revenueItemDto.applyOnlyMonth;
            const futureGrowthListToSave: BudgetItemRevenueFutureGrowthEntity[] = [];
            for (let i = 0; i < monthsList.length; i++) {
                // create futureGrowth
                const entity = new BudgetItemRevenueFutureGrowthEntity();
                if (i === 0 || !applyOnlyMonth) {
                    entity.monthlyGrowth = revenueFutureGrowthData.expectedMonthlyGrowth;
                    entity.month1Churn = revenueFutureGrowthData.month1ChurnRate;
                    entity.month2Churn = revenueFutureGrowthData.month2ChurnRate;
                    entity.month3Churn = revenueFutureGrowthData.month3ChurnRate;
                    entity.months4To12ChurnRate = revenueFutureGrowthData.months4To12ChurnRate;
                } else {
                    entity.monthlyGrowth = 0;
                    entity.month1Churn = 0;
                    entity.month2Churn = 0;
                    entity.month3Churn = 0;
                    entity.months4To12ChurnRate = 0;
                }

                futureGrowthListToSave.push(entity);
            }

            const createdFutureGrowthList = await this.budgetItemRevenueFutureGrowthRepository.save(
                futureGrowthListToSave,
            );

            let firstBudgetItemRevenueEntityList: BudgetItemRevenueEntity[] = [];
            let currentMonthValue = 0;
            for (let j = 0; j < revenueCurrentValueCalculationData.length; j++) {
                const entity = new BudgetItemRevenueEntity();
                entity.budgetItem = budgetItemEntity;
                entity.existingQuantityAtStartOfMonth = revenueCurrentValueCalculationData[j].quantity;
                entity.newMonthlyQuantities = 0;
                entity.quantityLeaveMonthOne = 0;
                entity.quantityLeaveMonthTwo = 0;
                entity.quantityLeaveMonthThree = 0;
                entity.residualChurnedQuantities = 0;

                entity.quantity =
                    entity.existingQuantityAtStartOfMonth +
                    entity.newMonthlyQuantities -
                    entity.quantityLeaveMonthOne -
                    entity.quantityLeaveMonthTwo -
                    entity.quantityLeaveMonthThree -
                    entity.residualChurnedQuantities;

                entity.price = revenueCurrentValueCalculationData[j].price;
                entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                const revenueItem = new RevenueItemEntity();
                revenueItem.id = revenueCurrentValueCalculationData[j].revenueSourceId;
                entity.revenueItem = revenueItem;

                entity.budgetItemRevenueFutureGrowth = createdFutureGrowthList[0];
                entity.budgetMonth = monthsList[0];

                currentMonthValue += entity.oldAddedValue;

                firstBudgetItemRevenueEntityList.push(entity);
            }
            monthsList[0].value = currentMonthValue;

            firstBudgetItemRevenueEntityList = await this.budgetItemRevenueRepository.save(
                firstBudgetItemRevenueEntityList,
            );

            const listToSave: BudgetItemRevenueEntity[] = [];
            for (let i = 1; i < monthsList.length; i++) {
                // create list of currentValue items
                let currentMonthValue = 0;
                for (let j = 0; j < revenueCurrentValueCalculationData.length; j++) {
                    let onePrevMonth: BudgetItemRevenueEntity = null;
                    let twoPrevMonth: BudgetItemRevenueEntity = null;
                    let threePrevMonth: BudgetItemRevenueEntity = null;
                    const length = revenueCurrentValueCalculationData.length;

                    if (i >= 1) {
                        if (i === 1) {
                            onePrevMonth = firstBudgetItemRevenueEntityList[j];
                        } else {
                            onePrevMonth = listToSave[(i - 2) * length + j];
                        }
                    }

                    if (i >= 2) {
                        if (i === 2) {
                            twoPrevMonth = firstBudgetItemRevenueEntityList[j];
                        } else {
                            twoPrevMonth = listToSave[(i - 3) * length + j];
                        }
                    }

                    if (i >= 3) {
                        if (i === 3) {
                            threePrevMonth = firstBudgetItemRevenueEntityList[j];
                        } else {
                            threePrevMonth = listToSave[(i - 4) * length + j];
                        }
                    }

                    let existingQuantityAtStartOfMonth = onePrevMonth.quantity;
                    let newMonthlyQuantities = (onePrevMonth.quantity * (createdFutureGrowthList[i].monthlyGrowth / 100.0));
                    let quantityLeaveMonthOne = (newMonthlyQuantities * (createdFutureGrowthList[i].month1Churn / 100.0));
                    let quantityLeaveMonthTwo = (onePrevMonth.newMonthlyQuantities * (createdFutureGrowthList[i].month2Churn / 100.0));
                    let quantityLeaveMonthThree = 0;
                    if (twoPrevMonth) {
                        quantityLeaveMonthThree = (twoPrevMonth.newMonthlyQuantities * (createdFutureGrowthList[i].month3Churn / 100.0));
                    }
                    let residualChurnedQuantities = 0;
                    if (threePrevMonth) {
                        residualChurnedQuantities = (threePrevMonth.quantity * (createdFutureGrowthList[i].months4To12ChurnRate / 100.0));
                    }

                    if (applyOnlyMonth) {
                        existingQuantityAtStartOfMonth = 0;
                        newMonthlyQuantities = 0;
                        quantityLeaveMonthOne = 0;
                        quantityLeaveMonthTwo = 0;
                        quantityLeaveMonthThree = 0;
                        residualChurnedQuantities = 0;
                    }

                    const entity = new BudgetItemRevenueEntity();
                    entity.budgetItem = budgetItemEntity;
                    entity.existingQuantityAtStartOfMonth = existingQuantityAtStartOfMonth;
                    entity.newMonthlyQuantities = newMonthlyQuantities;
                    entity.quantityLeaveMonthOne = quantityLeaveMonthOne;
                    entity.quantityLeaveMonthTwo = quantityLeaveMonthTwo;
                    entity.quantityLeaveMonthThree = quantityLeaveMonthThree;
                    entity.residualChurnedQuantities = residualChurnedQuantities;

                    entity.quantity =
                        entity.existingQuantityAtStartOfMonth +
                        entity.newMonthlyQuantities -
                        entity.quantityLeaveMonthOne -
                        entity.quantityLeaveMonthTwo -
                        entity.quantityLeaveMonthThree -
                        entity.residualChurnedQuantities;

                    entity.price = applyOnlyMonth ? 0 : revenueCurrentValueCalculationData[j].price;
                    entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[j].revenueSourceId;
                    entity.revenueItem = revenueItem;

                    entity.budgetItemRevenueFutureGrowth = createdFutureGrowthList[i];
                    entity.budgetMonth = monthsList[i];

                    entity.parentBudgetItemRevenue = firstBudgetItemRevenueEntityList[j];
                    entity.parentBudgetItemRevenueId = firstBudgetItemRevenueEntityList[j].id;

                    currentMonthValue += entity.oldAddedValue;

                    listToSave.push(entity);
                }

                monthsList[i].value = currentMonthValue;
            }

            await this.budgetItemRevenueRepository.save(listToSave);

            // update months
            await this.budgetMonthRepository.save(monthsList);
            monthsList.forEach((q) => updatedMonthSetIds.add(q.id));
        }

        await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);

        return null;
    }

    public async updateBudgetRevenueMonth(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        month: BudgetMonthEntity,
        budgetItemEntity: BudgetItemEntity,
        revenueItemDto: BudgetRevenueItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        // check that all incoming months have the same type
        const monthsListToUpdate: BudgetMonthEntity[] = await this.budgetMonthRepository.find({
            where: {
                budgetItem: budgetItemEntity,
                monthDate: revenueItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
            },
            order: {
                monthDate: "ASC",
            },
        });

        // Extract the IDs of monthsListToUpdate
        const monthListIdsToUpdate = monthsListToUpdate.map((month) => month.id);

        const manualCostItems = await this.budgetItemManualCostRepository.find({
            where: {
                budgetItem: budgetItemEntity,
                budgetMonth: In(monthListIdsToUpdate),
            },
        });

        const revenueItems = await this.budgetItemRevenueRepository.find({
            where: {
                budgetItem: budgetItemEntity,
                budgetMonth: In(monthListIdsToUpdate),
            },
        });

        // there are mix of types then remove all of them and re-create
        if (revenueItems.length > 0 && manualCostItems.length > 0) {
            await this.budgetItemManualCostRepository.remove(manualCostItems);
            await this.budgetItemRevenueRepository.remove(revenueItems);

            // create the revenue type
            const created = await this.createBudgetRevenue(
                userPayload,
                company,
                monthsListToUpdate,
                budgetItemEntity,
                revenueItemDto,
                language,
            );

            return created;
        }

        // we have four cases:
        // 1- the current type is manual and the new one is manual
        // 2- the current type is manual and the new one is not manual
        // 3- the current type is not manual and the new on is manual
        // 4- the current type is not manual and the new on is not manual

        // let's get the current type
        let isCurrentTypeManual: boolean;
        if (month.budgetItemManualCosts && month.budgetItemManualCosts.length === 1) {
            isCurrentTypeManual = true;
        } else if (month.budgetItemRevenues && month.budgetItemRevenues.length > 0) {
            isCurrentTypeManual = false;
        } else {
            console.error(month);
            throw new HttpException(
                {
                    message: "The current month is not Revenue type.",
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (isCurrentTypeManual && revenueItemDto.isManualInput) {
            // 1- the current type is manual and the new one is manual
            // update the manual entity
            const revenueManualData: BudgetRevenueManualCurrentValue =
                revenueItemDto.currentValue as BudgetRevenueManualCurrentValue;
            const revenueManualFutureGrowthData: BudgetRevenueManualFutureGrowth =
                revenueItemDto.futureGrowth as BudgetRevenueManualFutureGrowth;

            // call update manual
            const updated = this.budgetItemManualCostService.updateBudgetManualMonth(
                userPayload,
                company,
                month,
                budgetItemEntity,
                {
                    amount: revenueManualData.amount,
                    expectedMonthlyGrowth: revenueManualFutureGrowthData.expectedMonthlyGrowth,
                    applyOnlyMonth: revenueItemDto.applyOnlyMonth,
                },
                language,
            );
            return updated;
        } else if (isCurrentTypeManual && !revenueItemDto.isManualInput) {
            // 2- the current type is manual and the new one is not manual
            // remove the manual entity and create direct cost type
            const monthsToUpdate: BudgetMonthEntity[] = await this.budgetMonthRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    monthDate: revenueItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
                },
                order: {
                    monthDate: "ASC",
                },
            });

            // Extract the IDs of monthsToUpdate
            const monthIdsToUpdate = monthsToUpdate.map((month) => month.id);

            const manualItemsToDelete = await this.budgetItemManualCostRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    budgetMonth: In(monthIdsToUpdate),
                },
            });

            await this.budgetItemManualCostRepository.remove(manualItemsToDelete);

            // create the revenue type
            await this.createBudgetRevenue(
                userPayload,
                company,
                monthsToUpdate,
                budgetItemEntity,
                revenueItemDto,
                language,
            );
        } else if (!isCurrentTypeManual && revenueItemDto.isManualInput) {
            // 3- the current type is not manual and the new on is manual
            // remove the revenue entity and create manual type
            const monthsToUpdate: BudgetMonthEntity[] = await this.budgetMonthRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    monthDate: revenueItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
                },
                order: {
                    monthDate: "ASC",
                },
            });

            // Extract the IDs of monthsToUpdate
            const monthIdsToUpdate = monthsToUpdate.map((month) => month.id);

            const manualItemsToDelete = await this.budgetItemRevenueRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    budgetMonth: In(monthIdsToUpdate),
                },
            });

            await this.budgetItemRevenueRepository.remove(manualItemsToDelete);

            //  create the manual type
            await this.createBudgetRevenue(
                userPayload,
                company,
                monthsToUpdate,
                budgetItemEntity,
                revenueItemDto,
                language,
            );
        } else {
            // 4- the current type is not manual and the new on is not manual

            const revenueCurrentValueCalculationData: BudgetRevenueCurrentValueCalculation[] =
                revenueItemDto.currentValue as BudgetRevenueCurrentValueCalculation[];

            const revenueFutureGrowthData: BudgetRevenueFutureGrowth =
                revenueItemDto.futureGrowth as BudgetRevenueFutureGrowth;

            // check that all revenueSourceIds exist
            for (let i = 0; i < revenueCurrentValueCalculationData.length; i++) {
                const budgetItemExist = await this.revenueModelService.isRevenueItemExist(
                    userPayload.id,
                    company.id,
                    revenueCurrentValueCalculationData[i].revenueSourceId,
                    language,
                );

                if (!budgetItemExist) {
                    throw new HttpException(
                        {
                            message: await this.i18n.translate(RevenueModelAndItemKeys.ITEM_NOT_FOUND, {
                                lang: languageCode,
                            }),
                        },
                        HttpStatus.NOT_FOUND,
                    );
                }
            }

            // check if the Future Growth changed or not to make the update.
            const currentRevenueFutureGrowth = month.budgetItemRevenues[0].budgetItemRevenueFutureGrowth;
            if (
                currentRevenueFutureGrowth.monthlyGrowth !== revenueFutureGrowthData.expectedMonthlyGrowth ||
                currentRevenueFutureGrowth.month1Churn !== revenueFutureGrowthData.month1ChurnRate ||
                currentRevenueFutureGrowth.month2Churn !== revenueFutureGrowthData.month2ChurnRate ||
                currentRevenueFutureGrowth.month3Churn !== revenueFutureGrowthData.month3ChurnRate ||
                currentRevenueFutureGrowth.months4To12ChurnRate !== revenueFutureGrowthData.months4To12ChurnRate
            ) {
                currentRevenueFutureGrowth.monthlyGrowth = revenueFutureGrowthData.expectedMonthlyGrowth;
                currentRevenueFutureGrowth.month1Churn = revenueFutureGrowthData.month1ChurnRate;
                currentRevenueFutureGrowth.month2Churn = revenueFutureGrowthData.month2ChurnRate;
                currentRevenueFutureGrowth.month3Churn = revenueFutureGrowthData.month3ChurnRate;
                currentRevenueFutureGrowth.months4To12ChurnRate = revenueFutureGrowthData.months4To12ChurnRate;
                // update the Future Growth
                await this.budgetItemRevenueFutureGrowthRepository.save(currentRevenueFutureGrowth);
            }

            // we have three cases the number of elements increased, decreased or not changed.
            let firstBudgetItemRevenueEntityList: BudgetItemRevenueEntity[] = [];
            const budgetItemRevenueIdListToDelete: number[] = [];
            let currentMonthValue = 0;
            const currentItemsNumber = month.budgetItemRevenues.length;
            const newItemNumber = revenueCurrentValueCalculationData.length;
            const maxNumber = Math.max(currentItemsNumber, newItemNumber);

            for (let i = 0; i < maxNumber; i++) {
                if (i >= newItemNumber) {
                    // some items deleted.
                    budgetItemRevenueIdListToDelete.push(month.budgetItemRevenues[i].id);
                    continue;
                }

                let entity: BudgetItemRevenueEntity;
                if (i >= currentItemsNumber) {
                    // some items added.
                    entity = new BudgetItemRevenueEntity();
                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                    entity.revenueItem = revenueItem;
                    entity.budgetItem = budgetItemEntity;

                    entity.budgetItemRevenueFutureGrowth = currentRevenueFutureGrowth;
                    entity.budgetMonth = month;
                } else {
                    entity = month.budgetItemRevenues[i];
                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                    entity.revenueItem = revenueItem;
                }

                entity.existingQuantityAtStartOfMonth = revenueCurrentValueCalculationData[i].quantity;
                entity.newMonthlyQuantities = 0;
                entity.quantityLeaveMonthOne = 0;
                entity.quantityLeaveMonthTwo = 0;
                entity.quantityLeaveMonthThree = 0;
                entity.residualChurnedQuantities = 0;

                entity.quantity =
                    entity.existingQuantityAtStartOfMonth +
                    entity.newMonthlyQuantities -
                    entity.quantityLeaveMonthOne -
                    entity.quantityLeaveMonthTwo -
                    entity.quantityLeaveMonthThree -
                    entity.residualChurnedQuantities;

                entity.price = revenueCurrentValueCalculationData[i].price;
                entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                // remove the parent and as you're the first month
                // entity.parentBudgetItemRevenueId = null;
                entity.parentBudgetItemRevenue = null;

                currentMonthValue += entity.oldAddedValue;

                firstBudgetItemRevenueEntityList.push(entity);
            }
            month.value = currentMonthValue;

            // update or create the Budget Item Revenue Items
            firstBudgetItemRevenueEntityList = await this.budgetItemRevenueRepository.save(
                firstBudgetItemRevenueEntityList,
            );
            month.budgetItemRevenues = firstBudgetItemRevenueEntityList;

            // delete the Budget Item Revenue Items
            if (budgetItemRevenueIdListToDelete.length > 0) {
                await this.budgetItemRevenueRepository.delete(budgetItemRevenueIdListToDelete);
            }

            // handle the direct cost dependencies
            const budgetItemDirectCostListToUpdate: BudgetItemDirectCostEntity[] = [];
            const budgetMonthListToUpdate: BudgetMonthEntity[] = [];
            if (month.budgetItemDirectCostDependencies && month.budgetItemDirectCostDependencies.length > 0) {
                for (let i = 0; i < month.budgetItemDirectCostDependencies.length; i++) {
                    const budgetItemDirectCost = month.budgetItemDirectCostDependencies[
                        i
                    ] as BudgetItemDirectCostEntity;
                    // update month value
                    if (budgetItemDirectCost.budgetMonth) {
                        // remove the old added value to that month
                        budgetItemDirectCost.budgetMonth.value -= budgetItemDirectCost.oldAddedValue;
                        // calculate the new value
                        budgetItemDirectCost.oldAddedValue =
                            month.value * (budgetItemDirectCost.percentage / 100.0) + budgetItemDirectCost.amount;
                        // add the new value to the month
                        budgetItemDirectCost.budgetMonth.value += budgetItemDirectCost.oldAddedValue;
                        budgetItemDirectCostListToUpdate.push(budgetItemDirectCost);
                        budgetMonthListToUpdate.push(budgetItemDirectCost.budgetMonth);
                    }
                }
            }

            // update depended direct cost old added values
            await this.budgetItemDirectCostRepository.save(budgetItemDirectCostListToUpdate);

            // update the month and the all months dependencies as well
            await this.budgetMonthRepository.save(month);
            await this.budgetMonthRepository.save(budgetMonthListToUpdate);
            budgetMonthListToUpdate.forEach((q) => updatedMonthSetIds.add(q.id));
            updatedMonthSetIds.add(month.id);

            // start to apply to all the incoming months
            const applyOnlyMonth = !!revenueItemDto.applyOnlyMonth;
            if (!applyOnlyMonth) {
                // for now apply every time to the all incoming months.

                const incomingMonthList = await this.budgetMonthRepository.find({
                    where: {
                        monthDate: MoreThan(month.monthDate),
                        budgetItem: budgetItemEntity,
                    },
                    order: {
                        monthDate: "ASC",
                    },
                    relations: [
                        "budgetItem",
                        "budgetItemRevenues",
                        "budgetItemRevenues.budgetItemRevenueFutureGrowth",
                        "budgetItemDirectCostDependencies",
                        "budgetItemDirectCostDependencies.budgetMonth",
                    ],
                });

                const incomingBudgetItemRevenueIdListToDelete: number[] = [];
                const incomingBudgetItemRevenueEntityListToSave: BudgetItemRevenueEntity[] = [];
                const incomingBudgetItemRevenueFutureGrowthListToUpdate: BudgetItemRevenueFutureGrowthEntity[] = [];
                const incomingMonthsListToSave: BudgetMonthEntity[] = [];
                const incomingBudgetItemDirectCostListToUpdate: BudgetItemDirectCostEntity[] = [];
                const incomingBudgetMonthListToUpdate: BudgetMonthEntity[] = [];
                for (let j = 0; j < incomingMonthList.length; j++) {
                    const incomingMonth = incomingMonthList[j];

                    // check if the Future Growth changed or not to make the update.
                    const incomingRevenueFutureGrowth =
                        incomingMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth;
                    if (
                        incomingRevenueFutureGrowth.monthlyGrowth !==
                        revenueFutureGrowthData.expectedMonthlyGrowth ||
                        incomingRevenueFutureGrowth.month1Churn !== revenueFutureGrowthData.month1ChurnRate ||
                        incomingRevenueFutureGrowth.month2Churn !== revenueFutureGrowthData.month2ChurnRate ||
                        incomingRevenueFutureGrowth.month3Churn !== revenueFutureGrowthData.month3ChurnRate ||
                        incomingRevenueFutureGrowth.months4To12ChurnRate !==
                        revenueFutureGrowthData.months4To12ChurnRate
                    ) {
                        incomingRevenueFutureGrowth.monthlyGrowth = revenueFutureGrowthData.expectedMonthlyGrowth;
                        incomingRevenueFutureGrowth.month1Churn = revenueFutureGrowthData.month1ChurnRate;
                        incomingRevenueFutureGrowth.month2Churn = revenueFutureGrowthData.month2ChurnRate;
                        incomingRevenueFutureGrowth.month3Churn = revenueFutureGrowthData.month3ChurnRate;
                        incomingRevenueFutureGrowth.months4To12ChurnRate =
                            revenueFutureGrowthData.months4To12ChurnRate;

                        incomingBudgetItemRevenueFutureGrowthListToUpdate.push(incomingRevenueFutureGrowth);
                    }

                    let incomingMonthValue = 0;
                    const incomingCurrentItemsNumber = incomingMonth.budgetItemRevenues.length;
                    const incomingNewItemNumber = revenueCurrentValueCalculationData.length;
                    const incomingMaxNumber = Math.max(incomingCurrentItemsNumber, incomingNewItemNumber);
                    // we have three cases the number of elements increased, decreased or not changed.
                    for (let i = 0; i < incomingMaxNumber; i++) {
                        if (i >= incomingNewItemNumber) {
                            // some items deleted.
                            incomingBudgetItemRevenueIdListToDelete.push(incomingMonth.budgetItemRevenues[i].id);
                            continue;
                        }

                        let entity: BudgetItemRevenueEntity;
                        if (i >= incomingCurrentItemsNumber) {
                            // some items added.
                            entity = new BudgetItemRevenueEntity();
                            const revenueItem = new RevenueItemEntity();
                            revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                            entity.revenueItem = revenueItem;
                            entity.budgetItem = budgetItemEntity;

                            entity.budgetItemRevenueFutureGrowth = incomingRevenueFutureGrowth;
                        } else {
                            entity = incomingMonth.budgetItemRevenues[i];
                            const revenueItem = new RevenueItemEntity();
                            revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                            entity.revenueItem = revenueItem;
                        }

                        entity.budgetMonth = incomingMonth;
                        /** */
                        let onePrevMonth: BudgetItemRevenueEntity = null;
                        let twoPrevMonth: BudgetItemRevenueEntity = null;
                        let threePrevMonth: BudgetItemRevenueEntity = null;
                        const length = revenueCurrentValueCalculationData.length;

                        if (j >= 0) {
                            if (j === 0) {
                                onePrevMonth = firstBudgetItemRevenueEntityList[i];
                            } else {
                                onePrevMonth = incomingBudgetItemRevenueEntityListToSave[(j - 1) * length + i];
                            }
                        }

                        if (j >= 1) {
                            if (j === 1) {
                                twoPrevMonth = firstBudgetItemRevenueEntityList[i];
                            } else {
                                twoPrevMonth = incomingBudgetItemRevenueEntityListToSave[(j - 2) * length + i];
                            }
                        }

                        if (j >= 2) {
                            if (j === 2) {
                                threePrevMonth = firstBudgetItemRevenueEntityList[i];
                            } else {
                                threePrevMonth = incomingBudgetItemRevenueEntityListToSave[(j - 3) * length + i];
                            }
                        }

                        let existingQuantityAtStartOfMonth = onePrevMonth.quantity;
                        let newMonthlyQuantities = (onePrevMonth.quantity * (incomingRevenueFutureGrowth.monthlyGrowth / 100.0));
                        let quantityLeaveMonthOne = (newMonthlyQuantities * (incomingRevenueFutureGrowth.month1Churn / 100.0));
                        let quantityLeaveMonthTwo = (onePrevMonth.newMonthlyQuantities * (incomingRevenueFutureGrowth.month2Churn / 100.0));
                        let quantityLeaveMonthThree = 0;
                        if (twoPrevMonth) {
                            quantityLeaveMonthThree = (twoPrevMonth.newMonthlyQuantities * (incomingRevenueFutureGrowth.month3Churn / 100.0));
                        }
                        let residualChurnedQuantities = 0;
                        if (threePrevMonth) {
                            residualChurnedQuantities = (threePrevMonth.quantity * (incomingRevenueFutureGrowth.months4To12ChurnRate / 100.0));
                        }

                        entity.existingQuantityAtStartOfMonth = existingQuantityAtStartOfMonth;
                        entity.newMonthlyQuantities = newMonthlyQuantities;
                        entity.quantityLeaveMonthOne = quantityLeaveMonthOne;
                        entity.quantityLeaveMonthTwo = quantityLeaveMonthTwo;
                        entity.quantityLeaveMonthThree = quantityLeaveMonthThree;
                        entity.residualChurnedQuantities = residualChurnedQuantities;

                        entity.quantity =
                            entity.existingQuantityAtStartOfMonth +
                            entity.newMonthlyQuantities -
                            entity.quantityLeaveMonthOne -
                            entity.quantityLeaveMonthTwo -
                            entity.quantityLeaveMonthThree -
                            entity.residualChurnedQuantities;

                        entity.price = revenueCurrentValueCalculationData[i].price;
                        entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                        // set the parent to the revenue
                        entity.parentBudgetItemRevenue = firstBudgetItemRevenueEntityList[i];
                        entity.parentBudgetItemRevenueId = firstBudgetItemRevenueEntityList[i].id;

                        incomingMonthValue += entity.oldAddedValue;

                        incomingBudgetItemRevenueEntityListToSave.push(entity);
                    }
                    incomingMonth.value = incomingMonthValue;

                    // handle the direct cost dependencies
                    if (
                        incomingMonth.budgetItemDirectCostDependencies &&
                        incomingMonth.budgetItemDirectCostDependencies.length > 0
                    ) {
                        for (let i = 0; i < incomingMonth.budgetItemDirectCostDependencies.length; i++) {
                            const budgetItemDirectCost = incomingMonth.budgetItemDirectCostDependencies[
                                i
                            ] as BudgetItemDirectCostEntity;
                            // update month value
                            if (budgetItemDirectCost.budgetMonth) {
                                // remove the old added value to that month
                                budgetItemDirectCost.budgetMonth.value -= budgetItemDirectCost.oldAddedValue;
                                // calculate the new value
                                budgetItemDirectCost.oldAddedValue =
                                    incomingMonth.value * (budgetItemDirectCost.percentage / 100.0) +
                                    budgetItemDirectCost.amount;
                                // add the new value to the month
                                budgetItemDirectCost.budgetMonth.value += budgetItemDirectCost.oldAddedValue;

                                const budgetItemDirectCostToUpdate = new BudgetItemDirectCostEntity();
                                budgetItemDirectCostToUpdate.id = budgetItemDirectCost.id;
                                budgetItemDirectCostToUpdate.oldAddedValue = budgetItemDirectCost.oldAddedValue;
                                incomingBudgetItemDirectCostListToUpdate.push(budgetItemDirectCostToUpdate);

                                const budgetMonthToUpdate = new BudgetMonthEntity();
                                budgetMonthToUpdate.id = budgetItemDirectCost.budgetMonth.id;
                                budgetMonthToUpdate.value = budgetItemDirectCost.budgetMonth.value;

                                incomingBudgetMonthListToUpdate.push(budgetMonthToUpdate);
                            }
                        }
                    }

                    const budgetMonthToSave = new BudgetMonthEntity();
                    budgetMonthToSave.id = incomingMonth.id;
                    budgetMonthToSave.value = incomingMonth.value;
                    incomingMonthsListToSave.push(budgetMonthToSave);
                }
                // update the Future Growth
                await this.budgetItemRevenueFutureGrowthRepository.save(
                    incomingBudgetItemRevenueFutureGrowthListToUpdate,
                );

                // update or create the Budget Item Revenue Items
                await this.budgetItemRevenueRepository.save(incomingBudgetItemRevenueEntityListToSave);

                // delete the Budget Item Revenue Items
                if (incomingBudgetItemRevenueIdListToDelete.length > 0) {
                    await this.budgetItemRevenueRepository.delete(incomingBudgetItemRevenueIdListToDelete);
                }

                // update depended direct cost old added values
                await this.budgetItemDirectCostRepository.save(incomingBudgetItemDirectCostListToUpdate);

                // update the month and the all months dependencies as well
                await this.budgetMonthRepository.save(incomingMonthsListToSave);
                await this.budgetMonthRepository.save(incomingBudgetMonthListToUpdate);
                incomingMonthsListToSave.forEach((q) => updatedMonthSetIds.add(q.id));
                incomingBudgetMonthListToUpdate.forEach((q) => updatedMonthSetIds.add(q.id));
            }

            await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);
        }

        return null;
    }
}
