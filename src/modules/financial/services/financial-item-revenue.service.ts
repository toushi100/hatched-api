import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../company/services/company.service";
import { FinancialRevenueCurrentValueCalculation, FinancialRevenueFutureGrowth, FinancialRevenueItemDto, FinancialRevenueManualCurrentValue, FinancialRevenueManualFutureGrowth } from "../dto/request/revenue_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { RevenueModelService } from "src/modules/revenue-model/revenue-model.service";
import { RevenueModelAndItemKeys } from "src/modules/revenue-model/translate.enum";
import { FinancialItemRevenueFutureGrowthEntity } from "../entities/financial-item-revenue-future-growth.entity";
import { FinancialItemRevenueFutureGrowthRepository } from "../repositories/financial-item-revenue-future-growth.repository";
import { FinancialItemRevenueEntity } from "../entities/financial-item-revenue.entity";
import { RevenueItemEntity } from "src/modules/revenue-model/entities/revenue-item.entity";
import { FinancialItemRevenueRepository } from "../repositories/financial-item-revenue.repository";
import { FinancialQuarterRepository } from "../repositories/financial-quarter.repository";
import { FinancialItemDirectCostEntity } from "../entities/financial-item-direct-cost.entity";
import { FinancialItemDirectCostRepository } from "../repositories/financial-item-direct-cost.repository";
import { Equal, In, MoreThan, MoreThanOrEqual } from "typeorm";
import { FinancialSharedService } from "./financial-shared.service";
import { FinancialItemManualCostRepository } from "../repositories/financial-item-manual-cost.repository";
import { FinancialItemManualCostService } from "./financial-item-manual-cost.service";

@Injectable()
export class FinancialItemRevenueService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly revenueModelService: RevenueModelService,
        public readonly financialItemRevenueFutureGrowthRepository: FinancialItemRevenueFutureGrowthRepository,
        public readonly financialItemRevenueRepository: FinancialItemRevenueRepository,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        public readonly financialItemDirectCostRepository: FinancialItemDirectCostRepository,
        public readonly financialSharedService: FinancialSharedService,
        public readonly financialItemManualCostRepository: FinancialItemManualCostRepository,
        public readonly financialItemManualCostService: FinancialItemManualCostService,
    ) { }

    public async createFinancialRevenue(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quartersList: FinancialQuarterEntity[],
        financialItemEntity: FinancialItemEntity,
        revenueItemDto: FinancialRevenueItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        if (revenueItemDto.isManualInput) {
            const revenueManualData: FinancialRevenueManualCurrentValue =
                revenueItemDto.currentValue as FinancialRevenueManualCurrentValue;
            const revenueManualFutureGrowthData: FinancialRevenueManualFutureGrowth =
                revenueItemDto.futureGrowth as FinancialRevenueManualFutureGrowth;
            // call create manual
            const created = this.financialItemManualCostService.createFinancialManual(
                userPayload,
                company,
                quartersList,
                financialItemEntity,
                {
                    amount: revenueManualData.amount,
                    expectedQuarterlyGrowth: revenueManualFutureGrowthData.expectedQuarterlyGrowth,
                    applyOnlyMonth: revenueItemDto.applyOnlyMonth,
                },
                language,
            );
            return created;
        } else {
            const revenueCurrentValueCalculationData: FinancialRevenueCurrentValueCalculation[] =
                revenueItemDto.currentValue as FinancialRevenueCurrentValueCalculation[];

            const revenueFutureGrowthData: FinancialRevenueFutureGrowth =
                revenueItemDto.futureGrowth as FinancialRevenueFutureGrowth;

            // check that all revenueSourceIds exist
            for (let i = 0; i < revenueCurrentValueCalculationData.length; i++) {
                const financialItemExist = await this.revenueModelService.isRevenueItemExist(
                    userPayload.id,
                    company.id,
                    revenueCurrentValueCalculationData[i].revenueSourceId,
                    language,
                );

                if (!financialItemExist) {
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
            const futureGrowthListToSave: FinancialItemRevenueFutureGrowthEntity[] = [];
            for (let i = 0; i < quartersList.length; i++) {
                // create futureGrowth
                const entity = new FinancialItemRevenueFutureGrowthEntity();
                if (i === 0 || !applyOnlyMonth) {
                    entity.quarterlyGrowth = revenueFutureGrowthData.expectedQuarterlyGrowth;
                    entity.quarter1Churn = revenueFutureGrowthData.quarter1Churn;
                    entity.residualChurn = revenueFutureGrowthData.residualChurn;
                } else {
                    entity.quarterlyGrowth = 0;
                    entity.quarter1Churn = 0;
                    entity.residualChurn = 0;
                }

                futureGrowthListToSave.push(entity);
            }

            const createdFutureGrowthList = await this.financialItemRevenueFutureGrowthRepository.save(
                futureGrowthListToSave,
            );

            let firstFinancialItemRevenueEntityList: FinancialItemRevenueEntity[] = [];
            let currentQuarterValue = 0;
            for (let j = 0; j < revenueCurrentValueCalculationData.length; j++) {
                const entity = new FinancialItemRevenueEntity();
                entity.financialItem = financialItemEntity;
                entity.existingQuantityAtStartOfQuarter = revenueCurrentValueCalculationData[j].quantity;
                entity.newQuarterlyQuantities = 0;
                entity.quantityLeaveQuarterOne = 0;
                entity.residualChurnedQuantities = 0; // TODO get the value from budget

                entity.quantity =
                    entity.existingQuantityAtStartOfQuarter +
                    entity.newQuarterlyQuantities -
                    entity.quantityLeaveQuarterOne -
                    entity.residualChurnedQuantities;

                entity.price = revenueCurrentValueCalculationData[j].price;
                entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                const revenueItem = new RevenueItemEntity();
                revenueItem.id = revenueCurrentValueCalculationData[j].revenueSourceId;
                entity.revenueItem = revenueItem;

                entity.financialItemRevenueFutureGrowth = createdFutureGrowthList[0];
                entity.financialQuarter = quartersList[0];

                currentQuarterValue += entity.oldAddedValue;

                firstFinancialItemRevenueEntityList.push(entity);
            }
            quartersList[0].value = currentQuarterValue;

            firstFinancialItemRevenueEntityList = await this.financialItemRevenueRepository.save(
                firstFinancialItemRevenueEntityList,
            );

            const listToSave: FinancialItemRevenueEntity[] = [];
            for (let i = 1; i < quartersList.length; i++) {
                // create list of currentValue items
                let currentQuarterValue = 0;
                for (let j = 0; j < revenueCurrentValueCalculationData.length; j++) {
                    let prevQuarter: FinancialItemRevenueEntity = null;
                    const length = revenueCurrentValueCalculationData.length;

                    if (i >= 1) {
                        if (i === 1) {
                            prevQuarter = firstFinancialItemRevenueEntityList[j];
                        } else {
                            prevQuarter = listToSave[(i - 2) * length + j];
                        }
                    }

                    let existingQuantityAtStartOfQuarter = prevQuarter.quantity;
                    let newQuarterlyQuantities = (prevQuarter.quantity * (createdFutureGrowthList[i].quarterlyGrowth / 100.0));
                    let quantityLeaveQuarterOne = (newQuarterlyQuantities * (createdFutureGrowthList[i].quarter1Churn / 100.0));
                    let residualChurnedQuantities = (prevQuarter.quantity * (createdFutureGrowthList[i].residualChurn / 100.0));

                    if (applyOnlyMonth) {
                        existingQuantityAtStartOfQuarter = 0;
                        newQuarterlyQuantities = 0;
                        quantityLeaveQuarterOne = 0;
                        residualChurnedQuantities = 0;
                    }

                    const entity = new FinancialItemRevenueEntity();
                    entity.financialItem = financialItemEntity;
                    entity.existingQuantityAtStartOfQuarter = existingQuantityAtStartOfQuarter;
                    entity.newQuarterlyQuantities = newQuarterlyQuantities;
                    entity.quantityLeaveQuarterOne = quantityLeaveQuarterOne;
                    entity.residualChurnedQuantities = residualChurnedQuantities;

                    entity.quantity =
                        entity.existingQuantityAtStartOfQuarter +
                        entity.newQuarterlyQuantities -
                        entity.quantityLeaveQuarterOne -
                        entity.residualChurnedQuantities;

                    entity.price = applyOnlyMonth ? 0 : revenueCurrentValueCalculationData[j].price;
                    entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[j].revenueSourceId;
                    entity.revenueItem = revenueItem;

                    entity.financialItemRevenueFutureGrowth = createdFutureGrowthList[i];
                    entity.financialQuarter = quartersList[i];

                    entity.parentFinancialItemRevenue = firstFinancialItemRevenueEntityList[j];
                    entity.parentFinancialItemRevenueId = firstFinancialItemRevenueEntityList[j].id;

                    currentQuarterValue += entity.oldAddedValue;

                    listToSave.push(entity);
                }

                quartersList[i].value = currentQuarterValue;
            }

            await this.financialItemRevenueRepository.save(listToSave);

            // update quarters
            await this.financialQuarterRepository.save(quartersList);
            quartersList.forEach((q) => updatedQuarterSetIds.add(q.id));
        }

        await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);

        return null;
    }

    public async updateFinancialRevenueQuarter(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quarter: FinancialQuarterEntity,
        financialItemEntity: FinancialItemEntity,
        revenueItemDto: FinancialRevenueItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        // check that all incoming quarters have the same type
        const quartersListToUpdate: FinancialQuarterEntity[] = await this.financialQuarterRepository.find({
            where: {
                financialItem: financialItemEntity,
                quarterDate: revenueItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
            },
            order: {
                quarterDate: "ASC",
            },
        });

        // Extract the IDs of quartersToUpdate
        const quarterListIdsToUpdate = quartersListToUpdate.map((quarter) => quarter.id);

        const manualCostItems = await this.financialItemManualCostRepository.find({
            where: {
                financialItem: financialItemEntity,
                financialQuarter: In(quarterListIdsToUpdate),
            },
        });

        const revenueItems = await this.financialItemRevenueRepository.find({
            where: {
                financialItem: financialItemEntity,
                financialQuarter: In(quarterListIdsToUpdate),
            },
        });

        // there are mix of types then remove all of them and re-create
        if (revenueItems.length > 0 && manualCostItems.length > 0) {
            await this.financialItemManualCostRepository.remove(manualCostItems);
            await this.financialItemRevenueRepository.remove(revenueItems);

            // create the revenue type
            const created = await this.createFinancialRevenue(
                userPayload,
                company,
                quartersListToUpdate,
                financialItemEntity,
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
        if (quarter.financialItemManualCosts && quarter.financialItemManualCosts.length === 1) {
            isCurrentTypeManual = true;
        } else if (quarter.financialItemRevenues && quarter.financialItemRevenues.length > 0) {
            isCurrentTypeManual = false;
        } else {
            console.error(quarter);
            throw new HttpException(
                {
                    message: "The current quarter is not DirectCost type.",
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (isCurrentTypeManual && revenueItemDto.isManualInput) {
            // 1- the current type is manual and the new one is manual
            // update the manual entity
            // update the manual entity
            const revenueManualData: FinancialRevenueManualCurrentValue =
                revenueItemDto.currentValue as FinancialRevenueManualCurrentValue;
            const revenueManualFutureGrowthData: FinancialRevenueManualFutureGrowth =
                revenueItemDto.futureGrowth as FinancialRevenueManualFutureGrowth;
            // call update manual
            const updated = this.financialItemManualCostService.updateFinancialManualQuarter(
                userPayload,
                company,
                quarter,
                financialItemEntity,
                {
                    amount: revenueManualData.amount,
                    expectedQuarterlyGrowth: revenueManualFutureGrowthData.expectedQuarterlyGrowth,
                    applyOnlyMonth: revenueItemDto.applyOnlyMonth,
                },
                language,
            );
            return updated;
        } else if (isCurrentTypeManual && !revenueItemDto.isManualInput) {
            // 2- the current type is manual and the new one is not manual
            // remove the manual entity and create direct cost type
            const quartersToUpdate: FinancialQuarterEntity[] = await this.financialQuarterRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    quarterDate: revenueItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
                },
                order: {
                    quarterDate: "ASC",
                },
            });

            // Extract the IDs of quartersToUpdate
            const quarterIdsToUpdate = quartersToUpdate.map((quarter) => quarter.id);

            const manualItemsToDelete = await this.financialItemManualCostRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    financialQuarter: In(quarterIdsToUpdate),
                },
            });

            await this.financialItemManualCostRepository.remove(manualItemsToDelete);

            // create the direct cost type
            await this.createFinancialRevenue(
                userPayload,
                company,
                quartersToUpdate,
                financialItemEntity,
                revenueItemDto,
                language,
            );
        } else if (!isCurrentTypeManual && revenueItemDto.isManualInput) {
            // 3- the current type is not manual and the new on is manual
            // remove the direct cost entity and create manual type
            const quartersToUpdate: FinancialQuarterEntity[] = await this.financialQuarterRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    quarterDate: revenueItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
                },
                order: {
                    quarterDate: "ASC",
                },
            });

            // Extract the IDs of quartersToUpdate
            const quarterIdsToUpdate = quartersToUpdate.map((quarter) => quarter.id);

            const manualItemsToDelete = await this.financialItemRevenueRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    financialQuarter: In(quarterIdsToUpdate),
                },
            });

            await this.financialItemRevenueRepository.remove(manualItemsToDelete);

            //  create the manual type
            await this.createFinancialRevenue(
                userPayload,
                company,
                quartersToUpdate,
                financialItemEntity,
                revenueItemDto,
                language,
            );
        } else {
            // 4- the current type is not manual and the new on is not manual

            const revenueCurrentValueCalculationData: FinancialRevenueCurrentValueCalculation[] =
                revenueItemDto.currentValue as FinancialRevenueCurrentValueCalculation[];

            const revenueFutureGrowthData: FinancialRevenueFutureGrowth =
                revenueItemDto.futureGrowth as FinancialRevenueFutureGrowth;

            // check that all revenueSourceIds exist
            for (let i = 0; i < revenueCurrentValueCalculationData.length; i++) {
                const financialItemExist = await this.revenueModelService.isRevenueItemExist(
                    userPayload.id,
                    company.id,
                    revenueCurrentValueCalculationData[i].revenueSourceId,
                    language,
                );

                if (!financialItemExist) {
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
            const currentRevenueFutureGrowth = quarter.financialItemRevenues[0].financialItemRevenueFutureGrowth;
            if (
                currentRevenueFutureGrowth.quarterlyGrowth !== revenueFutureGrowthData.expectedQuarterlyGrowth ||
                currentRevenueFutureGrowth.quarter1Churn !== revenueFutureGrowthData.quarter1Churn ||
                currentRevenueFutureGrowth.residualChurn !== revenueFutureGrowthData.residualChurn
            ) {
                currentRevenueFutureGrowth.quarterlyGrowth = revenueFutureGrowthData.expectedQuarterlyGrowth;
                currentRevenueFutureGrowth.quarter1Churn = revenueFutureGrowthData.quarter1Churn;
                currentRevenueFutureGrowth.residualChurn = revenueFutureGrowthData.residualChurn;
                // update the Future Growth
                await this.financialItemRevenueFutureGrowthRepository.save(currentRevenueFutureGrowth);
            }

            // we have three cases the number of elements increased, decreased or not changed.
            let firstFinancialItemRevenueEntityList: FinancialItemRevenueEntity[] = [];
            const financialItemRevenueIdListToDelete: number[] = [];
            let currentQuarterValue = 0;
            const currentItemsNumber = quarter.financialItemRevenues.length;
            const newItemNumber = revenueCurrentValueCalculationData.length;
            const maxNumber = Math.max(currentItemsNumber, newItemNumber);

            for (let i = 0; i < maxNumber; i++) {
                if (i >= newItemNumber) {
                    // some items deleted.
                    financialItemRevenueIdListToDelete.push(quarter.financialItemRevenues[i].id);
                    continue;
                }

                let entity: FinancialItemRevenueEntity;
                if (i >= currentItemsNumber) {
                    // some items added.
                    entity = new FinancialItemRevenueEntity();
                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                    entity.revenueItem = revenueItem;
                    entity.financialItem = financialItemEntity;

                    entity.financialItemRevenueFutureGrowth = currentRevenueFutureGrowth;
                    entity.financialQuarter = quarter;
                } else {
                    entity = quarter.financialItemRevenues[i];
                    const revenueItem = new RevenueItemEntity();
                    revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                    entity.revenueItem = revenueItem;
                }

                entity.existingQuantityAtStartOfQuarter = revenueCurrentValueCalculationData[i].quantity;
                entity.newQuarterlyQuantities = 0;
                entity.quantityLeaveQuarterOne = 0;
                entity.residualChurnedQuantities = 0;

                entity.quantity =
                    entity.existingQuantityAtStartOfQuarter +
                    entity.newQuarterlyQuantities -
                    entity.quantityLeaveQuarterOne -
                    entity.residualChurnedQuantities;

                entity.price = revenueCurrentValueCalculationData[i].price;
                entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                // remove the parent and as you're the first quarter
                // entity.parentFinancialItemRevenueId = null;
                entity.parentFinancialItemRevenue = null;

                currentQuarterValue += entity.oldAddedValue;

                firstFinancialItemRevenueEntityList.push(entity);
            }
            quarter.value = currentQuarterValue;

            // update or create the Financial Item Revenue Items
            firstFinancialItemRevenueEntityList = await this.financialItemRevenueRepository.save(
                firstFinancialItemRevenueEntityList,
            );
            quarter.financialItemRevenues = firstFinancialItemRevenueEntityList;

            // delete the Financial Item Revenue Items
            if (financialItemRevenueIdListToDelete.length > 0) {
                await this.financialItemRevenueRepository.delete(financialItemRevenueIdListToDelete);
            }

            // handle the direct cost dependencies
            const financialItemDirectCostListToUpdate: FinancialItemDirectCostEntity[] = [];
            const financialQuarterListToUpdate: FinancialQuarterEntity[] = [];
            if (quarter.financialItemDirectCostDependencies && quarter.financialItemDirectCostDependencies.length > 0) {
                for (let i = 0; i < quarter.financialItemDirectCostDependencies.length; i++) {
                    const financialItemDirectCost = quarter.financialItemDirectCostDependencies[
                        i
                    ] as FinancialItemDirectCostEntity;
                    // update quarter value
                    if (financialItemDirectCost.financialQuarter) {
                        // remove the old added value to that quarter
                        financialItemDirectCost.financialQuarter.value -= financialItemDirectCost.oldAddedValue;
                        // calculate the new value
                        financialItemDirectCost.oldAddedValue =
                            quarter.value * (financialItemDirectCost.percentage / 100.0) +
                            financialItemDirectCost.amount;
                        // add the new value to the quarter
                        financialItemDirectCost.financialQuarter.value += financialItemDirectCost.oldAddedValue;
                        financialItemDirectCostListToUpdate.push(financialItemDirectCost);
                        financialQuarterListToUpdate.push(financialItemDirectCost.financialQuarter);
                    }
                }
            }

            // update depended direct cost old added values
            await this.financialItemDirectCostRepository.save(financialItemDirectCostListToUpdate);

            // update the quarter and the all quarters dependencies as well
            await this.financialQuarterRepository.save(quarter);
            await this.financialQuarterRepository.save(financialQuarterListToUpdate);
            financialQuarterListToUpdate.forEach((q) => updatedQuarterSetIds.add(q.id));
            updatedQuarterSetIds.add(quarter.id);

            // start to apply to all the incoming quarters
            const applyOnlyMonth = !!revenueItemDto.applyOnlyMonth;
            if (!applyOnlyMonth) {
                // for now apply every time to the all incoming quarters.

                const incomingQuarterList = await this.financialQuarterRepository.find({
                    where: {
                        quarterDate: MoreThan(quarter.quarterDate),
                        financialItem: financialItemEntity,
                    },
                    order: {
                        quarterDate: "ASC",
                    },
                    relations: [
                        "financialItem",
                        "financialItemRevenues",
                        "financialItemRevenues.financialItemRevenueFutureGrowth",
                        "financialItemDirectCostDependencies",
                        "financialItemDirectCostDependencies.financialQuarter",
                    ],
                });

                const incomingFinancialItemRevenueIdListToDelete: number[] = [];
                const incomingFinancialItemRevenueEntityListToSave: FinancialItemRevenueEntity[] = [];
                const incomingFinancialItemRevenueFutureGrowthListToUpdate: FinancialItemRevenueFutureGrowthEntity[] =
                    [];
                const incomingQuartersListToSave: FinancialQuarterEntity[] = [];
                const incomingFinancialItemDirectCostListToUpdate: FinancialItemDirectCostEntity[] = [];
                const incomingFinancialQuarterListToUpdate: FinancialQuarterEntity[] = [];
                for (let j = 0; j < incomingQuarterList.length; j++) {
                    const incomingQuarter = incomingQuarterList[j];

                    // check if the Future Growth changed or not to make the update.
                    const incomingRevenueFutureGrowth =
                        incomingQuarter.financialItemRevenues[0].financialItemRevenueFutureGrowth;
                    if (
                        incomingRevenueFutureGrowth.quarterlyGrowth !==
                        revenueFutureGrowthData.expectedQuarterlyGrowth ||
                        incomingRevenueFutureGrowth.quarter1Churn !== revenueFutureGrowthData.quarter1Churn ||
                        incomingRevenueFutureGrowth.residualChurn !== revenueFutureGrowthData.residualChurn
                    ) {
                        incomingRevenueFutureGrowth.quarterlyGrowth =
                            revenueFutureGrowthData.expectedQuarterlyGrowth;
                        incomingRevenueFutureGrowth.quarter1Churn = revenueFutureGrowthData.quarter1Churn;
                        incomingRevenueFutureGrowth.residualChurn = revenueFutureGrowthData.residualChurn;

                        incomingFinancialItemRevenueFutureGrowthListToUpdate.push(incomingRevenueFutureGrowth);
                    }

                    let incomingQuarterValue = 0;
                    const incomingCurrentItemsNumber = incomingQuarter.financialItemRevenues.length;
                    const incomingNewItemNumber = revenueCurrentValueCalculationData.length;
                    const incomingMaxNumber = Math.max(incomingCurrentItemsNumber, incomingNewItemNumber);
                    // we have three cases the number of elements increased, decreased or not changed.
                    for (let i = 0; i < incomingMaxNumber; i++) {
                        if (i >= incomingNewItemNumber) {
                            // some items deleted.
                            incomingFinancialItemRevenueIdListToDelete.push(
                                incomingQuarter.financialItemRevenues[i].id,
                            );
                            continue;
                        }

                        let entity: FinancialItemRevenueEntity;
                        if (i >= incomingCurrentItemsNumber) {
                            // some items added.
                            entity = new FinancialItemRevenueEntity();
                            const revenueItem = new RevenueItemEntity();
                            revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                            entity.revenueItem = revenueItem;
                            entity.financialItem = financialItemEntity;

                            entity.financialItemRevenueFutureGrowth = incomingRevenueFutureGrowth;
                        } else {
                            entity = incomingQuarter.financialItemRevenues[i];
                            const revenueItem = new RevenueItemEntity();
                            revenueItem.id = revenueCurrentValueCalculationData[i].revenueSourceId;
                            entity.revenueItem = revenueItem;
                        }

                        entity.financialQuarter = incomingQuarter;

                        let prevMonth: FinancialItemRevenueEntity = null;
                        const length = revenueCurrentValueCalculationData.length;

                        if (j >= 0) {
                            if (j === 0) {
                                prevMonth = firstFinancialItemRevenueEntityList[i];
                            } else {
                                prevMonth = incomingFinancialItemRevenueEntityListToSave[(j - 1) * length + i];
                            }
                        }

                        let existingQuantityAtStartOfQuarter = prevMonth.quantity;
                        let newQuarterlyQuantities = (prevMonth.quantity * (incomingRevenueFutureGrowth.quarterlyGrowth / 100.0));
                        let quantityLeaveQuarterOne = (newQuarterlyQuantities * (incomingRevenueFutureGrowth.quarter1Churn / 100.0));
                        let residualChurnedQuantities = (prevMonth.quantity * (incomingRevenueFutureGrowth.residualChurn / 100.0));

                        entity.existingQuantityAtStartOfQuarter = existingQuantityAtStartOfQuarter;
                        entity.newQuarterlyQuantities = newQuarterlyQuantities;
                        entity.quantityLeaveQuarterOne = quantityLeaveQuarterOne;
                        entity.residualChurnedQuantities = residualChurnedQuantities;

                        entity.quantity =
                            entity.existingQuantityAtStartOfQuarter +
                            entity.newQuarterlyQuantities -
                            entity.quantityLeaveQuarterOne -
                            entity.residualChurnedQuantities;

                        entity.price = revenueCurrentValueCalculationData[i].price;
                        entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                        // set the parent to the revenue
                        entity.parentFinancialItemRevenue = firstFinancialItemRevenueEntityList[i];
                        entity.parentFinancialItemRevenueId = firstFinancialItemRevenueEntityList[i].id;

                        incomingQuarterValue += entity.oldAddedValue;

                        incomingFinancialItemRevenueEntityListToSave.push(entity);
                    }
                    incomingQuarter.value = incomingQuarterValue;

                    // handle the direct cost dependencies
                    if (
                        incomingQuarter.financialItemDirectCostDependencies &&
                        incomingQuarter.financialItemDirectCostDependencies.length > 0
                    ) {
                        for (let i = 0; i < incomingQuarter.financialItemDirectCostDependencies.length; i++) {
                            const financialItemDirectCost = incomingQuarter.financialItemDirectCostDependencies[
                                i
                            ] as FinancialItemDirectCostEntity;
                            // update quarter value
                            if (financialItemDirectCost.financialQuarter) {
                                // remove the old added value to that quarter
                                financialItemDirectCost.financialQuarter.value -= financialItemDirectCost.oldAddedValue;
                                // calculate the new value
                                financialItemDirectCost.oldAddedValue =
                                    incomingQuarter.value * (financialItemDirectCost.percentage / 100.0) +
                                    financialItemDirectCost.amount;
                                // add the new value to the quarter
                                financialItemDirectCost.financialQuarter.value += financialItemDirectCost.oldAddedValue;

                                const financialItemDirectCostToUpdate = new FinancialItemDirectCostEntity();
                                financialItemDirectCostToUpdate.id = financialItemDirectCost.id;
                                financialItemDirectCostToUpdate.oldAddedValue = financialItemDirectCost.oldAddedValue;
                                incomingFinancialItemDirectCostListToUpdate.push(financialItemDirectCostToUpdate);

                                const financialQuarterToUpdate = new FinancialQuarterEntity();
                                financialQuarterToUpdate.id = financialItemDirectCost.financialQuarter.id;
                                financialQuarterToUpdate.value = financialItemDirectCost.financialQuarter.value;

                                incomingFinancialQuarterListToUpdate.push(financialQuarterToUpdate);
                            }
                        }
                    }

                    const financialQuarterToSave = new FinancialQuarterEntity();
                    financialQuarterToSave.id = incomingQuarter.id;
                    financialQuarterToSave.value = incomingQuarter.value;
                    incomingQuartersListToSave.push(financialQuarterToSave);
                }
                // update the Future Growth
                await this.financialItemRevenueFutureGrowthRepository.save(
                    incomingFinancialItemRevenueFutureGrowthListToUpdate,
                );

                // update or create the Financial Item Revenue Items
                await this.financialItemRevenueRepository.save(incomingFinancialItemRevenueEntityListToSave);

                // delete the Financial Item Revenue Items
                if (incomingFinancialItemRevenueIdListToDelete.length > 0) {
                    await this.financialItemRevenueRepository.delete(incomingFinancialItemRevenueIdListToDelete);
                }

                // update depended direct cost old added values
                await this.financialItemDirectCostRepository.save(incomingFinancialItemDirectCostListToUpdate);

                // update the quarter and the all quarters dependencies as well
                await this.financialQuarterRepository.save(incomingQuartersListToSave);
                await this.financialQuarterRepository.save(incomingFinancialQuarterListToUpdate);
                incomingQuartersListToSave.forEach((q) => updatedQuarterSetIds.add(q.id));
                incomingFinancialQuarterListToUpdate.forEach((q) => updatedQuarterSetIds.add(q.id));
            }

            await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);
        }

        return null;
    }
}
