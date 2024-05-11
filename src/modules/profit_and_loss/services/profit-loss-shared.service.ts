import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { CompanyService } from "../../company/services/company.service";
import { CompanyEntity } from "../../../modules/company/entities/company.entity";
import { In } from "typeorm";
import { BudgetCategory } from "../../../modules/budget/budget-category/types/budget_category.enum";
import { ActualBudgetItemRepository } from "../repositories/actual-budget-item.repository";
import { ActualBudgetMonthRatioRepository } from "../repositories/actual-budget-month-ratio.repository";
import { ActualBudgetMonthRepository } from "../repositories/actual-budget-month.repository";
import { ActualBudgetMonthRatioEntity } from "../entities/actual-budget-month-ratio.entity";
import { ActualBudgetMonthEntity } from "../entities/actual-budget-month.entity";

@Injectable()
export class ProfitLossSharedService {
    constructor(
        public readonly actualBudgetItemRepository: ActualBudgetItemRepository,
        public readonly actualBudgetMonthRatioRepository: ActualBudgetMonthRatioRepository,
        public readonly actualBudgetMonthRepository: ActualBudgetMonthRepository,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
    ) { }

    public async updateMonthRatios(
        companyId: number,
        updatedMonthSetIds: Set<number>,
        language: string,
    ): Promise<void> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const companyDto = await this.companyService.getCompanyById(companyId, language);

        if (!companyDto) {
            console.log(`The company with id= ${companyId} is not exist.`);
            return;
        }

        const companyEntity = new CompanyEntity();
        companyEntity.id = companyId;

        const monthRatios = await this.actualBudgetMonthRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const monthRatiosMapId: Map<number, ActualBudgetMonthRatioEntity> = new Map<number, ActualBudgetMonthRatioEntity>();
        monthRatios.forEach((q) => monthRatiosMapId.set(q.id, q));

        const updatedMonthList = await this.actualBudgetMonthRepository.find({
            where: {
                id: In([...updatedMonthSetIds]),
            },
            relations: ["actualBudgetMonthRatio"],
        });

        const listToSave: ActualBudgetMonthEntity[] = [];
        for (const month of updatedMonthList) {
            if (month && month.actualBudgetMonthRatio && monthRatiosMapId.has(month.actualBudgetMonthRatio.id)) {
                const actualBudgetMonthRatioEntity: ActualBudgetMonthRatioEntity = monthRatiosMapId.get(month.actualBudgetMonthRatio.id);
                if (month.categoryType === BudgetCategory.DIRECT_COSTS) {
                    actualBudgetMonthRatioEntity.totalDirectCosts -= month.oldValue;
                    actualBudgetMonthRatioEntity.totalDirectCosts += month.value;
                    month.oldValue = month.value;

                    const temp = new ActualBudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.REVENUE) {
                    actualBudgetMonthRatioEntity.grossIncome -= month.oldValue;
                    actualBudgetMonthRatioEntity.grossIncome += month.value;
                    month.oldValue = month.value;

                    const temp = new ActualBudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                    actualBudgetMonthRatioEntity.totalOperatingExpenses -= month.oldValue;
                    actualBudgetMonthRatioEntity.totalOperatingExpenses += month.value;
                    month.oldValue = month.value;

                    const temp = new ActualBudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.PERSONNEL_COSTS) {
                    actualBudgetMonthRatioEntity.totalPersonnelCosts -= month.oldValue;
                    actualBudgetMonthRatioEntity.totalPersonnelCosts += month.value;
                    month.oldValue = month.value;

                    const temp = new ActualBudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else {
                    console.error(`Can't find the categoryType for month: (${month})`);
                }
            } else {
                console.error(`Can't find the budgetMonthRatio for month: (${month})`);
            }
        }

        const monthRatiosListToSave: ActualBudgetMonthRatioEntity[] = [];
        for (const budgetMonthRatio of monthRatiosMapId.values()) {
            budgetMonthRatio.grossMargin = budgetMonthRatio.grossIncome - budgetMonthRatio.totalDirectCosts;
            budgetMonthRatio.grossMarginPercentage =
                100.0 *
                (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.grossMargin / budgetMonthRatio.grossIncome);

            budgetMonthRatio.ebitda =
                budgetMonthRatio.grossMargin -
                budgetMonthRatio.totalPersonnelCosts -
                budgetMonthRatio.totalOperatingExpenses;
            budgetMonthRatio.ebitdaPercentage =
                100.0 *
                (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.ebitda / budgetMonthRatio.grossIncome);

            monthRatiosListToSave.push(budgetMonthRatio);
        }

        // update month Ratios
        await this.actualBudgetMonthRatioRepository.save(monthRatiosListToSave);

        // update old value for the months
        await this.actualBudgetMonthRepository.save(listToSave);
    }


    public async updateMonthRatiosAfterDeletingMonths(
        companyId: number,
        deletedMonthsSet: Set<ActualBudgetMonthEntity>,
        language: string,
    ): Promise<void> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const companyDto = await this.companyService.getCompanyById(companyId, language);

        if (!companyDto) {
            console.log(`The company with id= ${companyId} is not exist.`);
            return;
        }

        const companyEntity = new CompanyEntity();
        companyEntity.id = companyId;

        const monthRatios = await this.actualBudgetMonthRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const monthRatiosMapId: Map<number, ActualBudgetMonthRatioEntity> = new Map<number, ActualBudgetMonthRatioEntity>();
        monthRatios.forEach((q) => monthRatiosMapId.set(q.id, q));

        for (const month of deletedMonthsSet) {
            if (month && month.actualBudgetMonthRatio && monthRatiosMapId.has(month.actualBudgetMonthRatio.id)) {
                const budgetMonthRatioEntity: ActualBudgetMonthRatioEntity = monthRatiosMapId.get(month.actualBudgetMonthRatio.id);
                if (month.categoryType === BudgetCategory.DIRECT_COSTS) {
                    budgetMonthRatioEntity.totalDirectCosts -= month.oldValue;
                } else if (month.categoryType === BudgetCategory.REVENUE) {
                    budgetMonthRatioEntity.grossIncome -= month.oldValue;
                } else if (month.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                    budgetMonthRatioEntity.totalOperatingExpenses -= month.oldValue;
                } else if (month.categoryType === BudgetCategory.PERSONNEL_COSTS) {
                    budgetMonthRatioEntity.totalPersonnelCosts -= month.oldValue;
                } else {
                    console.error(`Can't find the categoryType for month: (${month})`);
                }
            } else {
                console.error(`Can't find the budgetMonthRatio for month: (${month})`);
            }
        }

        const monthRatiosListToSave: ActualBudgetMonthRatioEntity[] = [];
        for (const budgetMonthRatio of monthRatiosMapId.values()) {
            budgetMonthRatio.grossMargin = budgetMonthRatio.grossIncome - budgetMonthRatio.totalDirectCosts;
            budgetMonthRatio.grossMarginPercentage =
                100.0 *
                (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.grossMargin / budgetMonthRatio.grossIncome);

            budgetMonthRatio.ebitda =
                budgetMonthRatio.grossMargin -
                budgetMonthRatio.totalPersonnelCosts -
                budgetMonthRatio.totalOperatingExpenses;
            budgetMonthRatio.ebitdaPercentage =
                100.0 *
                (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.ebitda / budgetMonthRatio.grossIncome);

            monthRatiosListToSave.push(budgetMonthRatio);
        }

        // update month Ratios
        await this.actualBudgetMonthRatioRepository.save(monthRatiosListToSave);
    }
}
