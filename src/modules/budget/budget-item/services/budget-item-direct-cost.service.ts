import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../../constants/languages";
import { BudgetItemKeys } from "../translate.enum";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { UserPayloadDto } from "../../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../../company/services/company.service";
import {
    BudgetDirectCostsCurrentValueCalculation,
    BudgetDirectCostsFutureGrowth,
    BudgetDirectCostsItemDto,
    BudgetDirectCostsManualCurrentValue,
} from "../dto/request/direct_cost_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { RevenueModelService } from "src/modules/revenue-model/revenue-model.service";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { BudgetSharedService } from "./budget-shared.service";
import { BudgetItemManualCostService } from "./budget-item-manual-cost.service";
import { BudgetItemDirectCostEntity } from "../entities/budget-item-direct-cost.entity";
import { AddOrSubtract } from "../../types/addOrSubtract.enum";
import { BudgetMonthRepository } from "../repositories/budget-month.repository";
import { BudgetItemDirectCostRepository } from "../repositories/budget-item-direct-cost.repository";
import { bool } from "aws-sdk/clients/signer";
import { Equal, In, MoreThanOrEqual } from "typeorm";
import { BudgetItemManualCostRepository } from "../repositories/budget-item-manual-cost.repository";

@Injectable()
export class BudgetItemDirectCostService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly revenueModelService: RevenueModelService,
        public readonly budgetSharedService: BudgetSharedService,
        public readonly budgetItemManualCostService: BudgetItemManualCostService,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        public readonly budgetItemDirectCostRepository: BudgetItemDirectCostRepository,
        public readonly budgetItemManualCostRepository: BudgetItemManualCostRepository,
    ) { }

    public async createBudgetDirectCost(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        monthsList: BudgetMonthEntity[],
        budgetItemEntity: BudgetItemEntity,
        directCostsItemDto: BudgetDirectCostsItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        if (directCostsItemDto.isManualInput) {
            const directCostsManualData: BudgetDirectCostsManualCurrentValue =
                directCostsItemDto.currentValue as BudgetDirectCostsManualCurrentValue;
            const directCostsFutureData: BudgetDirectCostsFutureGrowth =
                directCostsItemDto.futureGrowth as BudgetDirectCostsFutureGrowth;
            // call create manual
            const created = this.budgetItemManualCostService.createBudgetManual(
                userPayload,
                company,
                monthsList,
                budgetItemEntity,
                {
                    amount: directCostsManualData.amount,
                    expectedMonthlyGrowth: directCostsFutureData.expectedMonthlyGrowth,
                    applyOnlyMonth: directCostsItemDto.applyOnlyMonth,
                },
                language,
            );
            return created;
        } else {
            const directCostsCalculationData: BudgetDirectCostsCurrentValueCalculation =
                directCostsItemDto.currentValue as BudgetDirectCostsCurrentValueCalculation;

            const budgetItemExist = await this.budgetSharedService.isBudgetItemExist(
                userPayload.id,
                company.id,
                directCostsCalculationData.revenueItemId,
                language,
            );

            if (!budgetItemExist) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const sourceBudgetItemEntity = await this.budgetSharedService.getBudgetItemEntity(
                directCostsCalculationData.revenueItemId,
                language,
            );

            const applyOnlyMonth = !!directCostsItemDto.applyOnlyMonth;
            const listToSave: BudgetItemDirectCostEntity[] = [];
            for (let i = 0; i < monthsList.length; i++) {
                const entity = new BudgetItemDirectCostEntity();
                if (i === 0 || (directCostsCalculationData.willApplyPercentageToUpcomingMonths && !applyOnlyMonth)) {
                    entity.percentage = directCostsCalculationData.revenueItemPercentage;
                    entity.amount =
                        directCostsCalculationData.amount *
                        (directCostsCalculationData.addOrSubtract === AddOrSubtract.Add ? 1 : -1);
                } else {
                    entity.percentage = 0;
                    entity.amount = 0;
                }
                entity.budgetMonth = monthsList[i];
                entity.budgetItem = budgetItemEntity;
                entity.percentageFromBudgetMonth = sourceBudgetItemEntity.budgetMonths.find(
                    (m) => m.monthDate.toISOString() === monthsList[i].monthDate.toISOString(),
                );
                entity.oldAddedValue =
                    entity.percentageFromBudgetMonth.value * (entity.percentage / 100.0) + entity.amount;

                monthsList[i].value = entity.oldAddedValue;
                listToSave.push(entity);
            }

            await this.budgetItemDirectCostRepository.save(listToSave);

            // update months
            await this.budgetMonthRepository.save(monthsList);
            monthsList.forEach((q) => updatedMonthSetIds.add(q.id));

            await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);
        }

        return null;
    }

    public async updateBudgetDirectCostMonth(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        month: BudgetMonthEntity,
        budgetItemEntity: BudgetItemEntity,
        directCostsItemDto: BudgetDirectCostsItemDto,
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
                monthDate: directCostsItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
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

        const directCostItems = await this.budgetItemDirectCostRepository.find({
            where: {
                budgetItem: budgetItemEntity,
                budgetMonth: In(monthListIdsToUpdate),
            },
        });

        // there are mix of types then remove all of them and re-create
        if (directCostItems.length > 0 && manualCostItems.length > 0) {
            await this.budgetItemManualCostRepository.remove(manualCostItems);
            await this.budgetItemDirectCostRepository.remove(directCostItems);

            // create the revenue type
            const created = await this.createBudgetDirectCost(
                userPayload,
                company,
                monthsListToUpdate,
                budgetItemEntity,
                directCostsItemDto,
                language,
            );

            return created;
        }

        // we have four cases:
        // 1- the current type is manual and the new one is not manual
        // 2- the current type is manual and the new one is still manual
        // 3- the current type is not manual and the new on is manual
        // 4- the current type is not manual and the new on is still not manual

        // let's get the current type
        let isCurrentTypeManual: bool;
        if (month.budgetItemManualCosts && month.budgetItemManualCosts.length === 1) {
            isCurrentTypeManual = true;
        } else if (month.budgetItemDirectCosts && month.budgetItemDirectCosts.length === 1) {
            isCurrentTypeManual = false;
        } else {
            console.error(month);
            throw new HttpException(
                {
                    message: "The current month is not DirectCost type.",
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (isCurrentTypeManual && directCostsItemDto.isManualInput) {
            // 1- the current type is manual and the new one is not manual
            // update the manual entity
            const directCostsManualData: BudgetDirectCostsManualCurrentValue =
                directCostsItemDto.currentValue as BudgetDirectCostsManualCurrentValue;
            const directCostsFutureData: BudgetDirectCostsFutureGrowth =
                directCostsItemDto.futureGrowth as BudgetDirectCostsFutureGrowth;
            // call update manual
            const updated = this.budgetItemManualCostService.updateBudgetManualMonth(
                userPayload,
                company,
                month,
                budgetItemEntity,
                {
                    amount: directCostsManualData.amount,
                    expectedMonthlyGrowth: directCostsFutureData.expectedMonthlyGrowth,
                    applyOnlyMonth: directCostsItemDto.applyOnlyMonth,
                },
                language,
            );
            return updated;
        } else if (isCurrentTypeManual && !directCostsItemDto.isManualInput) {
            // 2- the current type is manual and the new one is still manual
            // remove the manual entity and create direct cost type
            const monthsToUpdate: BudgetMonthEntity[] = await this.budgetMonthRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    monthDate: directCostsItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
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

            // create the direct cost type
            await this.createBudgetDirectCost(
                userPayload,
                company,
                monthsToUpdate,
                budgetItemEntity,
                directCostsItemDto,
                language,
            );
        } else if (!isCurrentTypeManual && directCostsItemDto.isManualInput) {
            // 3- the current type is not manual and the new on is manual
            // remove the direct cost entity and create manual type
            const monthsToUpdate: BudgetMonthEntity[] = await this.budgetMonthRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    monthDate: directCostsItemDto.applyOnlyMonth ? Equal(month.monthDate) : MoreThanOrEqual(month.monthDate),
                },
                order: {
                    monthDate: "ASC",
                },
            });

            // Extract the IDs of monthsToUpdate
            const monthIdsToUpdate = monthsToUpdate.map((month) => month.id);

            const manualItemsToDelete = await this.budgetItemDirectCostRepository.find({
                where: {
                    budgetItem: budgetItemEntity,
                    budgetMonth: In(monthIdsToUpdate),
                },
            });

            await this.budgetItemDirectCostRepository.remove(manualItemsToDelete);

            //  create the manual type
            await this.createBudgetDirectCost(
                userPayload,
                company,
                monthsToUpdate,
                budgetItemEntity,
                directCostsItemDto,
                language,
            );
        } else {
            // 4- the current type is not manual and the new on is still not manual
            // update the direct cost entity
            const directCostsCalculationData: BudgetDirectCostsCurrentValueCalculation =
                directCostsItemDto.currentValue as BudgetDirectCostsCurrentValueCalculation;

            const budgetItemExist = await this.budgetSharedService.isBudgetItemExist(
                userPayload.id,
                company.id,
                directCostsCalculationData.revenueItemId,
                language,
            );

            if (!budgetItemExist) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(BudgetItemKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const sourceBudgetItemEntity = await this.budgetSharedService.getBudgetItemEntity(
                directCostsCalculationData.revenueItemId,
                language,
            );

            let monthsList: BudgetMonthEntity[] = [];
            const applyOnlyMonth = !!directCostsItemDto.applyOnlyMonth;
            if (directCostsCalculationData.willApplyPercentageToUpcomingMonths && !applyOnlyMonth) {
                monthsList = await this.budgetMonthRepository.find({
                    where: {
                        budgetItem: budgetItemEntity,
                        monthDate: MoreThanOrEqual(month.monthDate),
                    },
                    relations: [
                        "budgetItem",
                        "budgetItemDirectCosts",
                        "budgetItemDirectCosts.percentageFromBudgetMonth",
                        "budgetItemManualCosts",
                    ],
                    order: {
                        monthDate: "ASC",
                    },
                });
            } else {
                monthsList = await this.budgetMonthRepository.find({
                    where: {
                        budgetItem: budgetItemEntity,
                        monthDate: month.monthDate,
                    },
                    relations: [
                        "budgetItem",
                        "budgetItemDirectCosts",
                        "budgetItemDirectCosts.percentageFromBudgetMonth",
                        "budgetItemManualCosts",
                    ],
                    order: {
                        monthDate: "ASC",
                    },
                });
            }

            const listToSave: BudgetItemDirectCostEntity[] = [];
            for (let i = 0; i < monthsList.length; i++) {
                const entity = monthsList[i].budgetItemDirectCosts[0] as BudgetItemDirectCostEntity;
                monthsList[i].value -= entity.oldAddedValue;

                entity.percentage = directCostsCalculationData.revenueItemPercentage;
                if (i == 0) {
                    // update the amount and percentageFromBudgetMonth only for the first entity
                    entity.amount =
                        directCostsCalculationData.amount *
                        (directCostsCalculationData.addOrSubtract === AddOrSubtract.Add ? 1 : -1);
                    entity.percentageFromBudgetMonth = sourceBudgetItemEntity.budgetMonths.find(
                        (q) => q.monthDate.toISOString() === monthsList[i].monthDate.toISOString(),
                    );
                }
                entity.oldAddedValue =
                    entity.percentageFromBudgetMonth.value * (entity.percentage / 100.0) + entity.amount;

                monthsList[i].value += entity.oldAddedValue;
                listToSave.push(entity);
            }

            await this.budgetItemDirectCostRepository.save(listToSave);

            // update months
            await this.budgetMonthRepository.save(monthsList);
            monthsList.forEach((q) => updatedMonthSetIds.add(q.id));

            await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);
        }

        return null;
    }
}
