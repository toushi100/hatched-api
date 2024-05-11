import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { FinancialItemKeys } from "../translate.enum";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../company/services/company.service";
import {
    FinancialDirectCostsCurrentValueCalculation,
    FinancialDirectCostsFutureGrowth,
    FinancialDirectCostsItemDto,
    FinancialDirectCostsManualCurrentValue,
} from "../dto/request/direct_cost_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { RevenueModelService } from "src/modules/revenue-model/revenue-model.service";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { FinancialSharedService } from "./financial-shared.service";
import { FinancialItemManualCostService } from "./financial-item-manual-cost.service";
import { FinancialItemDirectCostEntity } from "../entities/financial-item-direct-cost.entity";
import { AddOrSubtract } from "../types/addOrSubtract.enum";
import { FinancialQuarterRepository } from "../repositories/financial-quarter.repository";
import { FinancialItemDirectCostRepository } from "../repositories/financial-item-direct-cost.repository";
import { bool } from "aws-sdk/clients/signer";
import { Equal, In, MoreThanOrEqual } from "typeorm";
import { FinancialItemManualCostRepository } from "../repositories/financial-item-manual-cost.repository";

@Injectable()
export class FinancialItemDirectCostService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly revenueModelService: RevenueModelService,
        public readonly financialSharedService: FinancialSharedService,
        public readonly financialItemManualCostService: FinancialItemManualCostService,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        public readonly financialItemDirectCostRepository: FinancialItemDirectCostRepository,
        public readonly financialItemManualCostRepository: FinancialItemManualCostRepository,
    ) { }

    public async createFinancialDirectCost(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quartersList: FinancialQuarterEntity[],
        financialItemEntity: FinancialItemEntity,
        directCostsItemDto: FinancialDirectCostsItemDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        if (directCostsItemDto.isManualInput) {
            const directCostsManualData: FinancialDirectCostsManualCurrentValue =
                directCostsItemDto.currentValue as FinancialDirectCostsManualCurrentValue;
            const directCostsFutureData: FinancialDirectCostsFutureGrowth =
                directCostsItemDto.futureGrowth as FinancialDirectCostsFutureGrowth;
            // call create manual
            const created = this.financialItemManualCostService.createFinancialManual(
                userPayload,
                company,
                quartersList,
                financialItemEntity,
                {
                    amount: directCostsManualData.amount,
                    expectedQuarterlyGrowth: directCostsFutureData.expectedQuarterlyGrowth,
                    applyOnlyMonth: directCostsItemDto.applyOnlyMonth,
                },
                language,
            );
            return created;
        } else {
            const directCostsCalculationData: FinancialDirectCostsCurrentValueCalculation =
                directCostsItemDto.currentValue as FinancialDirectCostsCurrentValueCalculation;

            const financialItemExist = await this.financialSharedService.isFinancialItemExist(
                userPayload.id,
                company.id,
                directCostsCalculationData.revenueItemId,
                language,
            );

            if (!financialItemExist) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const sourceFinancialItemEntity = await this.financialSharedService.getFinancialItemEntity(
                directCostsCalculationData.revenueItemId,
                language,
            );

            const applyOnlyMonth = !!directCostsItemDto.applyOnlyMonth;
            const listToSave: FinancialItemDirectCostEntity[] = [];
            for (let i = 0; i < quartersList.length; i++) {
                const entity = new FinancialItemDirectCostEntity();
                if (i === 0 || (directCostsCalculationData.willApplyPercentageToUpcomingMonths && !applyOnlyMonth)) {
                    entity.percentage = directCostsCalculationData.revenueItemPercentage;
                    entity.amount =
                        directCostsCalculationData.amount *
                        (directCostsCalculationData.addOrSubtract === AddOrSubtract.Add ? 1 : -1);
                } else {
                    entity.percentage = 0;
                    entity.amount = 0;
                }
                entity.financialQuarter = quartersList[i];
                entity.financialItem = financialItemEntity;
                entity.percentageFromFinancialQuarter = sourceFinancialItemEntity.financialQuarters.find(
                    (q) => q.quarterDate.toISOString() === quartersList[i].quarterDate.toISOString(),
                );
                entity.oldAddedValue =
                    entity.percentageFromFinancialQuarter.value * (entity.percentage / 100.0) + entity.amount;

                quartersList[i].value = entity.oldAddedValue;
                listToSave.push(entity);
            }

            await this.financialItemDirectCostRepository.save(listToSave);

            // update quarters
            await this.financialQuarterRepository.save(quartersList);
            quartersList.forEach((q) => updatedQuarterSetIds.add(q.id));

            await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);
        }

        return null;
    }

    public async updateFinancialDirectCostQuarter(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quarter: FinancialQuarterEntity,
        financialItemEntity: FinancialItemEntity,
        directCostsItemDto: FinancialDirectCostsItemDto,
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
                quarterDate: directCostsItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
            },
            order: {
                quarterDate: "ASC",
            },
        });

        // Extract the IDs of quartersListToUpdate
        const quarterListIdsToUpdate = quartersListToUpdate.map((quarter) => quarter.id);

        const manualCostItems = await this.financialItemManualCostRepository.find({
            where: {
                financialItem: financialItemEntity,
                financialQuarter: In(quarterListIdsToUpdate),
            },
        });

        const directCostItems = await this.financialItemDirectCostRepository.find({
            where: {
                financialItem: financialItemEntity,
                financialQuarter: In(quarterListIdsToUpdate),
            },
        });

        // there are mix of types then remove all of them and re-create
        if (directCostItems.length > 0 && manualCostItems.length > 0) {
            await this.financialItemManualCostRepository.remove(manualCostItems);
            await this.financialItemDirectCostRepository.remove(directCostItems);

            // create the revenue type
            const created = await this.createFinancialDirectCost(
                userPayload,
                company,
                quartersListToUpdate,
                financialItemEntity,
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
        if (quarter.financialItemManualCosts && quarter.financialItemManualCosts.length === 1) {
            isCurrentTypeManual = true;
        } else if (quarter.financialItemDirectCosts && quarter.financialItemDirectCosts.length === 1) {
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

        if (isCurrentTypeManual && directCostsItemDto.isManualInput) {
            // 1- the current type is manual and the new one is not manual
            // update the manual entity
            const directCostsManualData: FinancialDirectCostsManualCurrentValue =
                directCostsItemDto.currentValue as FinancialDirectCostsManualCurrentValue;
            const directCostsFutureData: FinancialDirectCostsFutureGrowth =
                directCostsItemDto.futureGrowth as FinancialDirectCostsFutureGrowth;
            // call update manual
            const updated = this.financialItemManualCostService.updateFinancialManualQuarter(
                userPayload,
                company,
                quarter,
                financialItemEntity,
                {
                    amount: directCostsManualData.amount,
                    expectedQuarterlyGrowth: directCostsFutureData.expectedQuarterlyGrowth,
                    applyOnlyMonth: directCostsItemDto.applyOnlyMonth,
                },
                language,
            );
            return updated;
        } else if (isCurrentTypeManual && !directCostsItemDto.isManualInput) {
            // 2- the current type is manual and the new one is still manual
            // remove the manual entity and create direct cost type
            const quartersToUpdate: FinancialQuarterEntity[] = await this.financialQuarterRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    quarterDate: directCostsItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
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
            await this.createFinancialDirectCost(
                userPayload,
                company,
                quartersToUpdate,
                financialItemEntity,
                directCostsItemDto,
                language,
            );
        } else if (!isCurrentTypeManual && directCostsItemDto.isManualInput) {
            // 3- the current type is not manual and the new on is manual
            // remove the direct cost entity and create manual type
            const quartersToUpdate: FinancialQuarterEntity[] = await this.financialQuarterRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    quarterDate: directCostsItemDto.applyOnlyMonth ? Equal(quarter.quarterDate) : MoreThanOrEqual(quarter.quarterDate),
                },
                order: {
                    quarterDate: "ASC",
                },
            });

            // Extract the IDs of quartersToUpdate
            const quarterIdsToUpdate = quartersToUpdate.map((quarter) => quarter.id);

            const manualItemsToDelete = await this.financialItemDirectCostRepository.find({
                where: {
                    financialItem: financialItemEntity,
                    financialQuarter: In(quarterIdsToUpdate),
                },
            });

            await this.financialItemDirectCostRepository.remove(manualItemsToDelete);

            //  create the manual type
            await this.createFinancialDirectCost(
                userPayload,
                company,
                quartersToUpdate,
                financialItemEntity,
                directCostsItemDto,
                language,
            );
        } else {
            // 4- the current type is not manual and the new on is still not manual
            // update the direct cost entity
            const directCostsCalculationData: FinancialDirectCostsCurrentValueCalculation =
                directCostsItemDto.currentValue as FinancialDirectCostsCurrentValueCalculation;

            const financialItemExist = await this.financialSharedService.isFinancialItemExist(
                userPayload.id,
                company.id,
                directCostsCalculationData.revenueItemId,
                language,
            );

            if (!financialItemExist) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(FinancialItemKeys.NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const sourceFinancialItemEntity = await this.financialSharedService.getFinancialItemEntity(
                directCostsCalculationData.revenueItemId,
                language,
            );

            let quartersList: FinancialQuarterEntity[] = [];
            const applyOnlyMonth = !!directCostsItemDto.applyOnlyMonth;
            if (directCostsCalculationData.willApplyPercentageToUpcomingMonths && !applyOnlyMonth) {
                quartersList = await this.financialQuarterRepository.find({
                    where: {
                        financialItem: financialItemEntity,
                        quarterDate: MoreThanOrEqual(quarter.quarterDate),
                    },
                    relations: [
                        "financialItem",
                        "financialItemDirectCosts",
                        "financialItemDirectCosts.percentageFromFinancialQuarter",
                        "financialItemManualCosts",
                    ],
                    order: {
                        quarterDate: "ASC",
                    },
                });
            } else {
                quartersList = await this.financialQuarterRepository.find({
                    where: {
                        financialItem: financialItemEntity,
                        quarterDate: quarter.quarterDate,
                    },
                    relations: [
                        "financialItem",
                        "financialItemDirectCosts",
                        "financialItemDirectCosts.percentageFromFinancialQuarter",
                        "financialItemManualCosts",
                    ],
                    order: {
                        quarterDate: "ASC",
                    },
                });
            }

            const listToSave: FinancialItemDirectCostEntity[] = [];
            for (let i = 0; i < quartersList.length; i++) {
                const entity = quartersList[i].financialItemDirectCosts[0] as FinancialItemDirectCostEntity;
                quartersList[i].value -= entity.oldAddedValue;

                entity.percentage = directCostsCalculationData.revenueItemPercentage;
                if (i == 0) {
                    // update the amount and percentageFromFinancialQuarter only for the first entity
                    entity.amount =
                        directCostsCalculationData.amount *
                        (directCostsCalculationData.addOrSubtract === AddOrSubtract.Add ? 1 : -1);
                    entity.percentageFromFinancialQuarter = sourceFinancialItemEntity.financialQuarters.find(
                        (q) => q.quarterDate.toISOString() === quartersList[i].quarterDate.toISOString(),
                    );
                }
                entity.oldAddedValue =
                    entity.percentageFromFinancialQuarter.value * (entity.percentage / 100.0) + entity.amount;

                quartersList[i].value += entity.oldAddedValue;
                listToSave.push(entity);
            }

            await this.financialItemDirectCostRepository.save(listToSave);

            // update quarters
            await this.financialQuarterRepository.save(quartersList);
            quartersList.forEach((q) => updatedQuarterSetIds.add(q.id));

            await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);
        }

        return null;
    }
}
