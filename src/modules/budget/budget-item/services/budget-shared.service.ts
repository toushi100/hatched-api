import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../../constants/languages";
import { BudgetItemRepository } from "../repositories/budget-item.repository";
import { CompanyService } from "../../../company/services/company.service";
import { BudgetMonthRepository } from "../repositories/budget-month.repository";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { BudgetMonthRatioRepository } from "../repositories/budget-month-ratio.repository";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { In } from "typeorm";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { BudgetMonthRatioEntity } from "../entities/budget-month-ratio.entity";

@Injectable()
export class BudgetSharedService {
    constructor(
        public readonly budgetItemRepository: BudgetItemRepository,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly budgetMonthRatioRepository: BudgetMonthRatioRepository,
    ) { }

    public async isBudgetItemExist(
        userId: number,
        companyId: number,
        budgetItemId: number,
        language: string,
    ): Promise<boolean> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["budgetCategory", "company", "company.user"],
            where: {
                company: {
                    id: companyId,
                    user: {
                        id: userId,
                    },
                },
            },
        });

        return !!budgetItem;
    }

    public async getBudgetItemEntity(budgetItemId: number, language: string): Promise<BudgetItemEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const budgetItem = await this.budgetItemRepository.findOne(budgetItemId, {
            relations: ["budgetCategory", "budgetMonths", "company"],
        });

        if (budgetItem && budgetItem.budgetMonths) {
            budgetItem.budgetMonths.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime());
        }
        return budgetItem;
    }

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

        const monthRatios = await this.budgetMonthRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const monthRatiosMapId: Map<number, BudgetMonthRatioEntity> = new Map<number, BudgetMonthRatioEntity>();
        monthRatios.forEach((q) => monthRatiosMapId.set(q.id, q));

        const updatedMonthList = await this.budgetMonthRepository.find({
            where: {
                id: In([...updatedMonthSetIds]),
            },
            relations: ["budgetMonthRatio"],
        });

        const listToSave: BudgetMonthEntity[] = [];
        for (const month of updatedMonthList) {
            if (month && month.budgetMonthRatio && monthRatiosMapId.has(month.budgetMonthRatio.id)) {
                const budgetMonthRatioEntity: BudgetMonthRatioEntity = monthRatiosMapId.get(month.budgetMonthRatio.id);
                if (month.categoryType === BudgetCategory.DIRECT_COSTS) {
                    budgetMonthRatioEntity.totalDirectCosts -= month.oldValue;
                    budgetMonthRatioEntity.totalDirectCosts += month.value;
                    month.oldValue = month.value;

                    const temp = new BudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.REVENUE) {
                    budgetMonthRatioEntity.grossIncome -= month.oldValue;
                    budgetMonthRatioEntity.grossIncome += month.value;
                    month.oldValue = month.value;

                    const temp = new BudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                    budgetMonthRatioEntity.totalOperatingExpenses -= month.oldValue;
                    budgetMonthRatioEntity.totalOperatingExpenses += month.value;
                    month.oldValue = month.value;

                    const temp = new BudgetMonthEntity();
                    temp.id = month.id;
                    temp.oldValue = month.oldValue;
                    listToSave.push(temp);
                } else if (month.categoryType === BudgetCategory.PERSONNEL_COSTS) {
                    budgetMonthRatioEntity.totalPersonnelCosts -= month.oldValue;
                    budgetMonthRatioEntity.totalPersonnelCosts += month.value;
                    month.oldValue = month.value;

                    const temp = new BudgetMonthEntity();
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

        const monthRatiosListToSave: BudgetMonthRatioEntity[] = [];
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
        await this.budgetMonthRatioRepository.save(monthRatiosListToSave);

        // update old value for the months
        await this.budgetMonthRepository.save(listToSave);
    }

    public async updateMonthRatiosAfterDeletingMonths(
        companyId: number,
        deletedMonthsSet: Set<BudgetMonthEntity>,
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

        const monthRatios = await this.budgetMonthRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const monthRatiosMapId: Map<number, BudgetMonthRatioEntity> = new Map<number, BudgetMonthRatioEntity>();
        monthRatios.forEach((q) => monthRatiosMapId.set(q.id, q));

        for (const month of deletedMonthsSet) {
            if (month && month.budgetMonthRatio && monthRatiosMapId.has(month.budgetMonthRatio.id)) {
                const budgetMonthRatioEntity: BudgetMonthRatioEntity = monthRatiosMapId.get(month.budgetMonthRatio.id);
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

        const monthRatiosListToSave: BudgetMonthRatioEntity[] = [];
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
        await this.budgetMonthRatioRepository.save(monthRatiosListToSave);
    }
}
