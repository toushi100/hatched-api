import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { FinancialItemRepository } from "../repositories/financial-item.repository";
import { CompanyService } from "../../company/services/company.service";
import { FinancialQuarterRepository } from "../repositories/financial-quarter.repository";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { FinancialQuarterRatioRepository } from "../repositories/financial-quarter-ratio.repository";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { In } from "typeorm";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialQuarterRatioEntity } from "../entities/financial-quarter-ratio.entity";

@Injectable()
export class FinancialSharedService {
    constructor(
        public readonly financialItemRepository: FinancialItemRepository,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly financialQuarterRatioRepository: FinancialQuarterRatioRepository,
    ) { }

    public async isFinancialItemExist(
        userId: number,
        companyId: number,
        financialItemId: number,
        language: string,
    ): Promise<boolean> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
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

        return !!financialItem;
    }

    public async getFinancialItemEntity(financialItemId: number, language: string): Promise<FinancialItemEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const financialItem = await this.financialItemRepository.findOne(financialItemId, {
            relations: ["budgetCategory", "financialQuarters", "company"],
        });

        if (financialItem && financialItem.financialQuarters) {
            financialItem.financialQuarters.sort((a, b) => a.quarterDate.getTime() - b.quarterDate.getTime());
        }
        return financialItem;
    }

    public async updateQuarterRatios(
        companyId: number,
        updatedQuarterSetIds: Set<number>,
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

        const quarterRatios = await this.financialQuarterRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const quarterRatiosMapId: Map<number, FinancialQuarterRatioEntity> = new Map<
            number,
            FinancialQuarterRatioEntity
        >();
        quarterRatios.forEach((q) => quarterRatiosMapId.set(q.id, q));

        const updatedQuarterList = await this.financialQuarterRepository.find({
            where: {
                id: In([...updatedQuarterSetIds]),
            },
            relations: ["financialQuarterRatio"],
        });

        const listToSave: FinancialQuarterEntity[] = [];
        for (const quarter of updatedQuarterList) {
            if (quarter && quarter.financialQuarterRatio && quarterRatiosMapId.has(quarter.financialQuarterRatio.id)) {
                const financialQuarterRatioEntity: FinancialQuarterRatioEntity = quarterRatiosMapId.get(
                    quarter.financialQuarterRatio.id,
                );
                if (quarter.categoryType === BudgetCategory.DIRECT_COSTS) {
                    financialQuarterRatioEntity.totalDirectCosts -= quarter.oldValue;
                    financialQuarterRatioEntity.totalDirectCosts += quarter.value;
                    quarter.oldValue = quarter.value;

                    const temp = new FinancialQuarterEntity();
                    temp.id = quarter.id;
                    temp.oldValue = quarter.oldValue;
                    listToSave.push(temp);
                } else if (quarter.categoryType === BudgetCategory.REVENUE) {
                    financialQuarterRatioEntity.grossIncome -= quarter.oldValue;
                    financialQuarterRatioEntity.grossIncome += quarter.value;
                    quarter.oldValue = quarter.value;

                    const temp = new FinancialQuarterEntity();
                    temp.id = quarter.id;
                    temp.oldValue = quarter.oldValue;
                    listToSave.push(temp);
                } else if (quarter.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                    financialQuarterRatioEntity.totalOperatingExpenses -= quarter.oldValue;
                    financialQuarterRatioEntity.totalOperatingExpenses += quarter.value;
                    quarter.oldValue = quarter.value;

                    const temp = new FinancialQuarterEntity();
                    temp.id = quarter.id;
                    temp.oldValue = quarter.oldValue;
                    listToSave.push(temp);
                } else if (quarter.categoryType === BudgetCategory.PERSONNEL_COSTS) {
                    financialQuarterRatioEntity.totalPersonnelCosts -= quarter.oldValue;
                    financialQuarterRatioEntity.totalPersonnelCosts += quarter.value;
                    quarter.oldValue = quarter.value;

                    const temp = new FinancialQuarterEntity();
                    temp.id = quarter.id;
                    temp.oldValue = quarter.oldValue;
                    listToSave.push(temp);
                } else {
                    console.error(`Can't find the categoryType for quarter: (${quarter})`);
                }
            } else {
                console.error(`Can't find the financialQuarterRatio for quarter: (${quarter})`);
            }
        }

        const quarterRatiosListToSave: FinancialQuarterRatioEntity[] = [];
        for (const financialQuarterRatio of quarterRatiosMapId.values()) {
            financialQuarterRatio.grossMargin =
                financialQuarterRatio.grossIncome - financialQuarterRatio.totalDirectCosts;
            financialQuarterRatio.grossMarginPercentage =
                100.0 *
                (financialQuarterRatio.grossIncome === 0
                    ? 0
                    : financialQuarterRatio.grossMargin / financialQuarterRatio.grossIncome);

            financialQuarterRatio.ebitda =
                financialQuarterRatio.grossMargin -
                financialQuarterRatio.totalPersonnelCosts -
                financialQuarterRatio.totalOperatingExpenses;
            financialQuarterRatio.ebitdaPercentage =
                100.0 *
                (financialQuarterRatio.grossIncome === 0
                    ? 0
                    : financialQuarterRatio.ebitda / financialQuarterRatio.grossIncome);

            quarterRatiosListToSave.push(financialQuarterRatio);
        }

        // update quarter Ratios
        await this.financialQuarterRatioRepository.save(quarterRatiosListToSave);

        // update old value for the quarters
        await this.financialQuarterRepository.save(listToSave);
    }

    public async updateQuarterRatiosAfterDeletingQuarters(
        companyId: number,
        deletedQuartersSet: Set<FinancialQuarterEntity>,
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

        const quarterRatios = await this.financialQuarterRatioRepository.find({
            where: {
                company: companyEntity,
            },
        });

        const quarterRatiosMapId: Map<number, FinancialQuarterRatioEntity> = new Map<
            number,
            FinancialQuarterRatioEntity
        >();
        quarterRatios.forEach((q) => quarterRatiosMapId.set(q.id, q));

        for (const quarter of deletedQuartersSet) {
            if (quarter && quarter.financialQuarterRatio && quarterRatiosMapId.has(quarter.financialQuarterRatio.id)) {
                const financialQuarterRatioEntity: FinancialQuarterRatioEntity = quarterRatiosMapId.get(
                    quarter.financialQuarterRatio.id,
                );
                if (quarter.categoryType === BudgetCategory.DIRECT_COSTS) {
                    financialQuarterRatioEntity.totalDirectCosts -= quarter.oldValue;
                } else if (quarter.categoryType === BudgetCategory.REVENUE) {
                    financialQuarterRatioEntity.grossIncome -= quarter.oldValue;
                } else if (quarter.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                    financialQuarterRatioEntity.totalOperatingExpenses -= quarter.oldValue;
                } else if (quarter.categoryType === BudgetCategory.PERSONNEL_COSTS) {
                    financialQuarterRatioEntity.totalPersonnelCosts -= quarter.oldValue;
                } else {
                    console.error(`Can't find the categoryType for quarter: (${quarter})`);
                }
            } else {
                console.error(`Can't find the financialQuarterRatio for quarter: (${quarter})`);
            }
        }

        const quarterRatiosListToSave: FinancialQuarterRatioEntity[] = [];
        for (const financialQuarterRatio of quarterRatiosMapId.values()) {
            financialQuarterRatio.grossMargin =
                financialQuarterRatio.grossIncome - financialQuarterRatio.totalDirectCosts;
            financialQuarterRatio.grossMarginPercentage =
                100.0 *
                (financialQuarterRatio.grossIncome === 0
                    ? 0
                    : financialQuarterRatio.grossMargin / financialQuarterRatio.grossIncome);

            financialQuarterRatio.ebitda =
                financialQuarterRatio.grossMargin -
                financialQuarterRatio.totalPersonnelCosts -
                financialQuarterRatio.totalOperatingExpenses;
            financialQuarterRatio.ebitdaPercentage =
                100.0 *
                (financialQuarterRatio.grossIncome === 0
                    ? 0
                    : financialQuarterRatio.ebitda / financialQuarterRatio.grossIncome);

            quarterRatiosListToSave.push(financialQuarterRatio);
        }

        // update quarter Ratios
        await this.financialQuarterRatioRepository.save(quarterRatiosListToSave);
    }
}
