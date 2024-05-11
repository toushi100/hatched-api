import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../company/services/company.service";
import { FinancialOtherItemsDto } from "../dto/request/other_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { FinancialItemManualCostRepository } from "../repositories/financial-item-manual-cost.repository";
import { FinancialItemManualCostEntity } from "../entities/financial-item-manual-cost.entity";
import { FinancialQuarterRepository } from "../repositories/financial-quarter.repository";
import { MoreThan } from "typeorm";
import { FinancialSharedService } from "./financial-shared.service";
import { HelperService } from "src/shared/services/helper";

@Injectable()
export class FinancialItemManualCostService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly financialItemManualCostRepository: FinancialItemManualCostRepository,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        public readonly financialSharedService: FinancialSharedService,
        private readonly helperService: HelperService,
    ) { }

    public async createFinancialManual(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quartersList: FinancialQuarterEntity[],
        financialItemEntity: FinancialItemEntity,
        otherItemsDto: FinancialOtherItemsDto,
        language: string,
    ): Promise<FinancialItemManualCostEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        let firstFinancialItemManualCostEntity = new FinancialItemManualCostEntity();
        firstFinancialItemManualCostEntity.amount = otherItemsDto.amount;
        firstFinancialItemManualCostEntity.oldAddedValue = otherItemsDto.amount;
        firstFinancialItemManualCostEntity.quarterlyGrowth = otherItemsDto.expectedQuarterlyGrowth;
        firstFinancialItemManualCostEntity.financialQuarter = quartersList[0];
        firstFinancialItemManualCostEntity.financialItem = financialItemEntity;
        // update quarter's value
        quartersList[0].value = firstFinancialItemManualCostEntity.amount;

        firstFinancialItemManualCostEntity = await this.financialItemManualCostRepository.save(
            firstFinancialItemManualCostEntity,
        );

        const listToSave: FinancialItemManualCostEntity[] = [];
        let currentAmount = otherItemsDto.amount;
        const applyOnlyMonth = !!otherItemsDto.applyOnlyMonth;
        for (let i = 1; i < quartersList.length; i++) {
            const financialItemManualCostEntity = new FinancialItemManualCostEntity();
            currentAmount = currentAmount + currentAmount * (otherItemsDto.expectedQuarterlyGrowth / 100.0);
            if (applyOnlyMonth) {
                financialItemManualCostEntity.amount = 0;
                financialItemManualCostEntity.oldAddedValue = 0;
                financialItemManualCostEntity.quarterlyGrowth = 0;
            } else {
                financialItemManualCostEntity.amount = isNaN(currentAmount) ? 0 : currentAmount;
                financialItemManualCostEntity.oldAddedValue = isNaN(currentAmount) ? 0 : currentAmount;
                financialItemManualCostEntity.quarterlyGrowth = otherItemsDto.expectedQuarterlyGrowth;
            }

            financialItemManualCostEntity.financialQuarter = quartersList[i];
            financialItemManualCostEntity.financialItem = financialItemEntity;
            financialItemManualCostEntity.parentFinancialItemManualCost = firstFinancialItemManualCostEntity;
            financialItemManualCostEntity.parentFinancialItemManualCostId = firstFinancialItemManualCostEntity.id;

            // update quarter's value
            quartersList[i].value = financialItemManualCostEntity.amount;

            listToSave.push(financialItemManualCostEntity);
        }

        await this.financialItemManualCostRepository.save(listToSave);

        // update quarters
        await this.financialQuarterRepository.save(quartersList);
        quartersList.forEach((q) => updatedQuarterSetIds.add(q.id));

        await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);

        return firstFinancialItemManualCostEntity;
    }

    public async updateFinancialManualQuarter(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        quarter: FinancialQuarterEntity,
        financialItemEntity: FinancialItemEntity,
        otherItemsDto: FinancialOtherItemsDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        if (quarter.financialItemManualCosts.length !== 1) {
            console.error(quarter.financialItemManualCosts);
            throw new HttpException(
                {
                    message: "The financialItemManualCosts should be one element only.",
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        let firstFinancialItemManualCostEntity = quarter.financialItemManualCosts[0] as FinancialItemManualCostEntity;
        quarter.value -= firstFinancialItemManualCostEntity.oldAddedValue;

        firstFinancialItemManualCostEntity.amount = otherItemsDto.amount;
        firstFinancialItemManualCostEntity.oldAddedValue = otherItemsDto.amount;
        firstFinancialItemManualCostEntity.quarterlyGrowth = otherItemsDto.expectedQuarterlyGrowth;
        firstFinancialItemManualCostEntity.financialQuarter = quarter;
        firstFinancialItemManualCostEntity.financialItem = financialItemEntity;

        // remove the parent and as you're the first quarter
        firstFinancialItemManualCostEntity.parentFinancialItemManualCost = null;
        // firstFinancialItemManualCostEntity.parentFinancialItemManualCostId = null;

        // update the manual cost
        firstFinancialItemManualCostEntity = await this.financialItemManualCostRepository.save(
            firstFinancialItemManualCostEntity,
        );

        // update quarter's value
        quarter.value = firstFinancialItemManualCostEntity.amount;
        await this.financialQuarterRepository.save(quarter);
        updatedQuarterSetIds.add(quarter.id);

        // start to apply to all the incoming quarters
        const applyOnlyMonth = !!otherItemsDto.applyOnlyMonth;
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
                relations: ["financialItem", "financialItemManualCosts"],
            });

            const incomingManualCostListToSave: FinancialItemManualCostEntity[] = [];
            const incomingQuartersListToSave: FinancialQuarterEntity[] = [];
            let currentAmount = otherItemsDto.amount;
            for (let i = 0; i < incomingQuarterList.length; i++) {
                const incomingQuarter = incomingQuarterList[i];
                const financialItemManualCostEntity = incomingQuarterList[i]
                    .financialItemManualCosts[0] as FinancialItemManualCostEntity;

                incomingQuarter.value -= financialItemManualCostEntity.oldAddedValue;

                currentAmount = currentAmount + currentAmount * (otherItemsDto.expectedQuarterlyGrowth / 100.0);
                financialItemManualCostEntity.amount = currentAmount;
                financialItemManualCostEntity.oldAddedValue = currentAmount;
                financialItemManualCostEntity.quarterlyGrowth = otherItemsDto.expectedQuarterlyGrowth;
                financialItemManualCostEntity.financialQuarter = incomingQuarter;
                financialItemManualCostEntity.financialItem = financialItemEntity;
                financialItemManualCostEntity.parentFinancialItemManualCost = firstFinancialItemManualCostEntity;
                financialItemManualCostEntity.parentFinancialItemManualCostId = firstFinancialItemManualCostEntity.id;

                // update quarter's value
                incomingQuarter.value = financialItemManualCostEntity.amount;

                incomingManualCostListToSave.push(financialItemManualCostEntity);

                incomingQuartersListToSave.push(incomingQuarter);
            }

            await this.financialItemManualCostRepository.save(incomingManualCostListToSave);

            // update quarters
            await this.financialQuarterRepository.save(incomingQuartersListToSave);
            incomingQuartersListToSave.forEach((q) => updatedQuarterSetIds.add(q.id));
        }

        await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);

        return null;
    }

    public async updatePersonnelCostsFinancialManual(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        financialItem: FinancialItemEntity,
        startDate: Date,
        endDate: Date,
        monthlySalary: number,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the quarter ids that changed in that function.
        // will use it to update the Quarter Ratios.
        const updatedQuarterSetIds: Set<number> = new Set();

        const financialItemManualCostEntityListToSave: FinancialItemManualCostEntity[] = [];
        const financialQuartersListToSave: FinancialQuarterEntity[] = [];
        const firstDayOfStartDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), 1) : startDate;
        const firstDayOfEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), 1) : endDate;

        for (const quarter of financialItem.financialQuarters) {
            const monthsIntersection = Math.min(this.helperService.getMonthsIntersection(quarter.quarterDate, firstDayOfStartDate, firstDayOfEndDate), 3);
            if (monthsIntersection > 0 && (quarter.financialItemManualCosts && quarter.financialItemManualCosts.length > 0)) {
                const financialQuarter: FinancialQuarterEntity = new FinancialQuarterEntity();
                financialQuarter.id = quarter.id;
                financialQuarter.value = quarter.value + (monthlySalary * monthsIntersection);

                const financialItemManualCost: FinancialItemManualCostEntity = new FinancialItemManualCostEntity();
                financialItemManualCost.id = quarter.financialItemManualCosts[0].id;
                financialItemManualCost.amount = quarter.financialItemManualCosts[0].amount + (monthlySalary * monthsIntersection);
                financialItemManualCost.oldAddedValue = quarter.financialItemManualCosts[0].oldAddedValue + (monthlySalary * monthsIntersection);

                financialItemManualCostEntityListToSave.push(financialItemManualCost);
                financialQuartersListToSave.push(financialQuarter);
                updatedQuarterSetIds.add(quarter.id);
            }
        }

        if (financialItemManualCostEntityListToSave && financialItemManualCostEntityListToSave.length > 0) {
            await this.financialItemManualCostRepository.save(financialItemManualCostEntityListToSave);

            // update quarters
            await this.financialQuarterRepository.save(financialQuartersListToSave);

            await this.financialSharedService.updateQuarterRatios(company.id, updatedQuarterSetIds, language);
        }
    }
}
