import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../../constants/languages";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { UserPayloadDto } from "../../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../../company/services/company.service";
import { BudgetOtherItemsDto } from "../dto/request/other_data.dto";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { BudgetItemManualCostRepository } from "../repositories/budget-item-manual-cost.repository";
import { BudgetItemManualCostEntity } from "../entities/budget-item-manual-cost.entity";
import { BudgetMonthRepository } from "../repositories/budget-month.repository";
import { MoreThan } from "typeorm";
import { BudgetSharedService } from "./budget-shared.service";

@Injectable()
export class BudgetItemManualCostService {
    constructor(
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly budgetItemManualCostRepository: BudgetItemManualCostRepository,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        public readonly budgetSharedService: BudgetSharedService,
    ) { }

    public async createBudgetManual(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        monthsList: BudgetMonthEntity[],
        budgetItemEntity: BudgetItemEntity,
        otherItemsDto: BudgetOtherItemsDto,
        language: string,
    ): Promise<BudgetItemManualCostEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        let firstBudgetItemManualCostEntity = new BudgetItemManualCostEntity();
        firstBudgetItemManualCostEntity.amount = otherItemsDto.amount;
        firstBudgetItemManualCostEntity.oldAddedValue = otherItemsDto.amount;
        firstBudgetItemManualCostEntity.monthlyGrowth = otherItemsDto.expectedMonthlyGrowth;
        firstBudgetItemManualCostEntity.budgetMonth = monthsList[0];
        firstBudgetItemManualCostEntity.budgetItem = budgetItemEntity;
        // update month's value
        monthsList[0].value = firstBudgetItemManualCostEntity.amount;

        firstBudgetItemManualCostEntity = await this.budgetItemManualCostRepository.save(
            firstBudgetItemManualCostEntity,
        );

        const listToSave: BudgetItemManualCostEntity[] = [];
        let currentAmount = otherItemsDto.amount;
        const applyOnlyMonth = !!otherItemsDto.applyOnlyMonth;
        for (let i = 1; i < monthsList.length; i++) {
            const budgetItemManualCostEntity = new BudgetItemManualCostEntity();
            currentAmount = currentAmount + currentAmount * (otherItemsDto.expectedMonthlyGrowth / 100.0);
            if (applyOnlyMonth) {
                budgetItemManualCostEntity.amount = 0;
                budgetItemManualCostEntity.oldAddedValue = 0;
                budgetItemManualCostEntity.monthlyGrowth = 0;
            } else {
                budgetItemManualCostEntity.amount = currentAmount;
                budgetItemManualCostEntity.oldAddedValue = currentAmount;
                budgetItemManualCostEntity.monthlyGrowth = otherItemsDto.expectedMonthlyGrowth;
            }
            budgetItemManualCostEntity.budgetMonth = monthsList[i];
            budgetItemManualCostEntity.budgetItem = budgetItemEntity;
            budgetItemManualCostEntity.parentBudgetItemManualCost = firstBudgetItemManualCostEntity;
            budgetItemManualCostEntity.parentBudgetItemManualCostId = firstBudgetItemManualCostEntity.id;

            // update month's value
            monthsList[i].value = budgetItemManualCostEntity.amount;

            listToSave.push(budgetItemManualCostEntity);
        }

        await this.budgetItemManualCostRepository.save(listToSave);

        // update months
        await this.budgetMonthRepository.save(monthsList);
        monthsList.forEach((q) => updatedMonthSetIds.add(q.id));

        await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);

        return firstBudgetItemManualCostEntity;
    }

    public async updateBudgetManualMonth(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        month: BudgetMonthEntity,
        budgetItemEntity: BudgetItemEntity,
        otherItemsDto: BudgetOtherItemsDto,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        if (month.budgetItemManualCosts.length !== 1) {
            console.error(month.budgetItemManualCosts);
            throw new HttpException(
                {
                    message: "The budgetItemManualCosts should be one element only.",
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        let firstBudgetItemManualCostEntity = month.budgetItemManualCosts[0] as BudgetItemManualCostEntity;
        month.value -= firstBudgetItemManualCostEntity.oldAddedValue;

        firstBudgetItemManualCostEntity.amount = otherItemsDto.amount;
        firstBudgetItemManualCostEntity.oldAddedValue = otherItemsDto.amount;
        firstBudgetItemManualCostEntity.monthlyGrowth = otherItemsDto.expectedMonthlyGrowth;
        firstBudgetItemManualCostEntity.budgetMonth = month;
        firstBudgetItemManualCostEntity.budgetItem = budgetItemEntity;

        // remove the parent and as you're the first month
        firstBudgetItemManualCostEntity.parentBudgetItemManualCost = null;
        // firstBudgetItemManualCostEntity.parentBudgetItemManualCostId = null;

        // update the manual cost
        firstBudgetItemManualCostEntity = await this.budgetItemManualCostRepository.save(
            firstBudgetItemManualCostEntity,
        );

        // update month's value
        month.value = firstBudgetItemManualCostEntity.amount;
        await this.budgetMonthRepository.save(month);
        updatedMonthSetIds.add(month.id);

        // start to apply to all the incoming months
        const applyOnlyMonth = !!otherItemsDto.applyOnlyMonth;
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
                relations: ["budgetItem", "budgetItemManualCosts"],
            });

            const incomingManualCostListToSave: BudgetItemManualCostEntity[] = [];
            const incomingMonthsListToSave: BudgetMonthEntity[] = [];
            let currentAmount = otherItemsDto.amount;
            for (let i = 0; i < incomingMonthList.length; i++) {
                const incomingMonth = incomingMonthList[i];
                const budgetItemManualCostEntity = incomingMonthList[i]
                    .budgetItemManualCosts[0] as BudgetItemManualCostEntity;

                incomingMonth.value -= budgetItemManualCostEntity.oldAddedValue;

                currentAmount = currentAmount + currentAmount * (otherItemsDto.expectedMonthlyGrowth / 100.0);
                budgetItemManualCostEntity.amount = currentAmount;
                budgetItemManualCostEntity.oldAddedValue = currentAmount;
                budgetItemManualCostEntity.monthlyGrowth = otherItemsDto.expectedMonthlyGrowth;
                budgetItemManualCostEntity.budgetMonth = incomingMonth;
                budgetItemManualCostEntity.budgetItem = budgetItemEntity;
                budgetItemManualCostEntity.parentBudgetItemManualCost = firstBudgetItemManualCostEntity;
                budgetItemManualCostEntity.parentBudgetItemManualCostId = firstBudgetItemManualCostEntity.id;

                // update month's value
                incomingMonth.value = budgetItemManualCostEntity.amount;

                incomingManualCostListToSave.push(budgetItemManualCostEntity);

                incomingMonthsListToSave.push(incomingMonth);
            }

            await this.budgetItemManualCostRepository.save(incomingManualCostListToSave);

            // update months
            await this.budgetMonthRepository.save(incomingMonthsListToSave);
            incomingMonthsListToSave.forEach((q) => updatedMonthSetIds.add(q.id));
        }

        await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);

        return null;
    }

    public async updatePersonnelCostsBudgetManual(
        userPayload: UserPayloadDto,
        company: CompanyEntity,
        budgetItem: BudgetItemEntity,
        startDate: Date,
        endDate: Date,
        monthlySalary: number,
        language: string,
    ): Promise<any> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // the set of all the month ids that changed in that function.
        // will use it to update the Month Ratios.
        const updatedMonthSetIds: Set<number> = new Set();

        const budgetItemManualCostEntityListToSave: BudgetItemManualCostEntity[] = [];
        const budgetMonthEntityListToSave: BudgetMonthEntity[] = [];
        const firstDayOfStartDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), 1) : startDate;
        const firstDayOfEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), 1) : endDate;

        for (const month of budgetItem.budgetMonths) {
            if (((firstDayOfStartDate && firstDayOfStartDate <= month.monthDate) || !firstDayOfStartDate)
                && ((firstDayOfEndDate && firstDayOfEndDate >= month.monthDate) || !firstDayOfEndDate)
                && (month.budgetItemManualCosts && month.budgetItemManualCosts.length > 0)) {

                const budgetMonth: BudgetMonthEntity = new BudgetMonthEntity();
                budgetMonth.id = month.id;
                budgetMonth.value = month.value + monthlySalary;

                const budgetItemManualCost: BudgetItemManualCostEntity = new BudgetItemManualCostEntity();
                budgetItemManualCost.id = month.budgetItemManualCosts[0].id;
                budgetItemManualCost.amount = month.budgetItemManualCosts[0].amount + monthlySalary;
                budgetItemManualCost.oldAddedValue = month.budgetItemManualCosts[0].oldAddedValue + monthlySalary;

                budgetItemManualCostEntityListToSave.push(budgetItemManualCost);
                budgetMonthEntityListToSave.push(budgetMonth);
                updatedMonthSetIds.add(budgetMonth.id);
            }
        }

        if (budgetItemManualCostEntityListToSave && budgetItemManualCostEntityListToSave.length > 0) {
            await this.budgetItemManualCostRepository.save(budgetItemManualCostEntityListToSave);

            // update months
            await this.budgetMonthRepository.save(budgetMonthEntityListToSave);

            await this.budgetSharedService.updateMonthRatios(company.id, updatedMonthSetIds, language);
        }

        return null;
    }
}
