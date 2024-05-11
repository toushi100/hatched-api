import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { GetValuationDto } from "./dto/request/get_valuation.dto";
import { FinancialService } from "../financial/services/financial.service";
import { CompanyService } from "../company/services/company.service";
import { BudgetItemService } from "../budget/budget-item/services/budget-item.service";
import { BudgetMonthRatioEntity } from "../budget/budget-item/entities/budget-month-ratio.entity";
import { FinancialQuarterRatioEntity } from "../financial/entities/financial-quarter-ratio.entity";
import { ValuationType } from "./types/valuation_type.enum";
import { BudgetCategory } from "../budget/budget-category/types/budget_category.enum";
import { BudgetItemEntity } from "../budget/budget-item/entities/budget-item.entity";
import { FinancialItemEntity } from "../financial/entities/financial-item.entity";
import { ValuationItemListDto } from "./dto/response/valuation_item_list.dto";
import { BusinessModel } from "../revenue-model/types/business_model.enum";

@Injectable()
export class ValuationService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        private readonly financialService: FinancialService,
        private readonly budgetItemService: BudgetItemService,
        private readonly i18n: I18nService,
    ) { }

    public async getValuationData(
        userPayload: UserPayloadDto,
        getValuationDto: GetValuationDto,
        language: string
    ): Promise<ValuationItemListDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        return this.getCompanyValuationData(userCompany.id, getValuationDto, language);
    }

    public async getCompanyValuationData(
        companyId: number,
        getValuationDto: GetValuationDto,
        language: string
    ): Promise<ValuationItemListDto[]> {
        const valuation: ValuationItemListDto[] = [];
        const budgetMonthRatios: BudgetMonthRatioEntity[] = await this.budgetItemService.getCompanyBudgetMonthRatios(companyId, language);
        const quarterRatios: FinancialQuarterRatioEntity[] = await this.financialService.getCompanyFinancialQuarterRatios(companyId, language);

        let netQuantityLastMonthInBudget = 0; // for financial

        let columnCount = 0;
        let yearsHeader = [];
        let growthList = [];
        let growthMarginList = [];
        let yearlyChurnList = [];
        let multipleList = [];
        let mrrList = [];
        let valueOfBusinessList = [];

        let allListMap = {
            0: growthList,
            1: growthMarginList,
            2: yearlyChurnList,
            3: multipleList,
            4: mrrList,
            5: valueOfBusinessList,
        };

        const columnName = ['Business Model', 'KPI', 'Growth',
            'Gross Margin', 'Yearly Churn', 'Multiple', 'MRR (Annualised)', 'Value of Business'];

        // handle budget
        if (budgetMonthRatios && budgetMonthRatios.length > 0) {
            // see https://app.clickup.com/t/866aqt9en
            columnCount += 1;
            yearsHeader.push(budgetMonthRatios[0]?.monthDate?.getFullYear());

            // growth
            const totalMonths = budgetMonthRatios.length;
            const firstMonth = budgetMonthRatios[0].grossIncome;
            const lastMonth = budgetMonthRatios[totalMonths - 1].grossIncome;
            const growth = firstMonth === 0 ? 0 : ((((lastMonth * totalMonths) - (firstMonth * totalMonths)) / (firstMonth * totalMonths)) * 100.0);
            growthList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(growth) : null);

            // Gross Margin
            let totalGrossMargin = 0;
            let totalGrossIncome = 0;
            budgetMonthRatios.forEach((b) => {
                totalGrossIncome += b.grossIncome;
                totalGrossMargin += b.grossMargin;
            });
            let grossMargin = totalGrossIncome == 0 ? 0 : ((totalGrossMargin / totalGrossIncome) * 100.0);
            growthMarginList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(grossMargin) : null);

            // Yearly Churn (need added/removed users)
            let yearlyChurn = 0;
            let usersGained = 0;
            let usersLost = 0;
            const budgetItems: BudgetItemEntity[] = await this.budgetItemService.getCompanyBudgetItems(companyId, BudgetCategory.REVENUE, language);

            for (const budgetItem of budgetItems) {
                if (budgetItem && budgetItem.budgetItemRevenues) {
                    for (let i = 0; i < budgetItem.budgetItemRevenues.length; i++) {
                        let isBusinessModelOther: boolean = false;
                        if (budgetItem.budgetItemRevenues[i].revenueItem?.revenueModel?.businessModel === BusinessModel.Other) {
                            isBusinessModelOther = true;
                        }

                        if (i === budgetItem.budgetItemRevenues.length - 1) {
                            netQuantityLastMonthInBudget += isBusinessModelOther ? 1 : budgetItem.budgetItemRevenues[i].quantity;
                        }

                        usersGained += isBusinessModelOther ? 1 : budgetItem.budgetItemRevenues[i].newMonthlyQuantities;
                        usersLost += isBusinessModelOther ? 0 : budgetItem.budgetItemRevenues[i].quantityLeaveMonthOne;
                        usersLost += isBusinessModelOther ? 0 : budgetItem.budgetItemRevenues[i].quantityLeaveMonthTwo;
                        usersLost += isBusinessModelOther ? 0 : budgetItem.budgetItemRevenues[i].quantityLeaveMonthThree;
                        usersLost += isBusinessModelOther ? 0 : budgetItem.budgetItemRevenues[i].residualChurnedQuantities;
                    }
                }

                // for the manual num of users gained is one and no lost
                if (budgetItem && budgetItem.budgetItemManualCosts) {
                    for (let i = 0; i < budgetItem.budgetItemManualCosts.length; i++) {
                        if (i === budgetItem.budgetItemManualCosts.length - 1) {
                            // netQuantityLastMonthInBudget += budgetItem.budgetItemManualCosts[i].amount;
                            netQuantityLastMonthInBudget += 1;
                        }

                        // usersGained += budgetItem.budgetItemManualCosts[i].amount;
                        usersGained += 1;
                    }
                }
            }

            console.log('budget usersLost=', usersLost, ' usersGained=', usersGained);
            yearlyChurn = usersGained === 0 ? 0 : ((usersLost / usersGained) * 100.0);
            yearlyChurnList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(yearlyChurn) : null);

            // Multiple
            const multiple = this.getMultiple(growth, grossMargin, yearlyChurn);
            multipleList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(multiple) : null);

            // MRR (Annualised)
            const mrr = lastMonth * totalMonths;
            mrrList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(mrr) : null);

            // Value of Business
            valueOfBusinessList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(mrr * multiple) : null);
        }

        // handle financial
        if (quarterRatios && quarterRatios.length > 0) {
            const financialItems: FinancialItemEntity[] = await this.financialService.getCompanyFinancialItems(companyId, BudgetCategory.REVENUE, language);

            let firstQuarter: FinancialQuarterRatioEntity = null;
            let lastQuarter: FinancialQuarterRatioEntity = null;
            let prevNetQuantityLastYearInFinancial;
            for (let i = 0; i < quarterRatios.length; i++) {
                if (i % 4 === 0) {
                    firstQuarter = quarterRatios[i];
                }
                if (i % 4 === 3) {
                    lastQuarter = quarterRatios[i];

                    columnCount += 1;
                    yearsHeader.push(firstQuarter?.quarterDate?.getFullYear());

                    // growth
                    let growth;
                    if (i === 3) {
                        const firstQuarterValue = firstQuarter.grossIncome;
                        const lastQuarterValue = lastQuarter.grossIncome;
                        growth = firstQuarterValue === 0 ? 0 : ((((lastQuarterValue * 4) - (firstQuarterValue * 4)) / (firstQuarterValue * 4)) * 100.0);
                        growthList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(growth) : null);
                    } else {
                        const currentTotal = quarterRatios[i].grossIncome + quarterRatios[i - 1].grossIncome + quarterRatios[i - 2].grossIncome + quarterRatios[i - 3].grossIncome;
                        const prevTotal = quarterRatios[i - 4].grossIncome + quarterRatios[i - 5].grossIncome + quarterRatios[i - 6].grossIncome + quarterRatios[i - 7].grossIncome;
                        growth = prevTotal === 0 ? 0 : (((currentTotal - prevTotal) / prevTotal) * 100.0);
                        growthList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(growth) : null);
                    }

                    // Gross Margin
                    let totalGrossIncome = 0;
                    let totalDirectCost = 0;
                    for (let j = i - 3; j <= i; j++) {
                        totalGrossIncome += quarterRatios[j].grossIncome;
                        totalDirectCost += quarterRatios[j].totalDirectCosts;
                    }
                    const grossMargin = totalGrossIncome === 0 ? 0 : (((totalGrossIncome - totalDirectCost) / totalGrossIncome) * 100.0);
                    growthMarginList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(grossMargin) : null);

                    // Yearly Churn (need added/removed users)
                    let yearlyChurn = 0;
                    let usersGained = (i === 3 ? netQuantityLastMonthInBudget : prevNetQuantityLastYearInFinancial);
                    let usersLost = 0;

                    prevNetQuantityLastYearInFinancial = 0;
                    for (const financialItem of financialItems) {
                        if (financialItem && financialItem.financialItemRevenues && i < financialItem.financialItemRevenues.length) {
                            for (let j = i - 3; j < financialItem.financialItemRevenues.length && j <= i; j++) {
                                let isBusinessModelOther: boolean = false;
                                if (financialItem.financialItemRevenues[j].revenueItem?.revenueModel?.businessModel === BusinessModel.Other) {
                                    isBusinessModelOther = true;
                                }

                                usersGained += isBusinessModelOther ? 1 : financialItem.financialItemRevenues[j].newQuarterlyQuantities;
                                usersLost += isBusinessModelOther ? 0 : financialItem.financialItemRevenues[j].quantityLeaveQuarterOne;
                                usersLost += isBusinessModelOther ? 0 : financialItem.financialItemRevenues[j].residualChurnedQuantities;
                            }

                            let isBusinessModelOther: boolean = false;
                            if (financialItem.financialItemRevenues[i].revenueItem?.revenueModel?.businessModel === BusinessModel.Other) {
                                isBusinessModelOther = true;
                            }

                            prevNetQuantityLastYearInFinancial += isBusinessModelOther ? 1 : financialItem.financialItemRevenues[i].quantity;
                        }

                        // for the manual num of users gained is one and no lost
                        if (financialItem && financialItem.financialItemManualCosts && i < financialItem.financialItemManualCosts.length) {
                            for (let j = i - 3; j < financialItem.financialItemManualCosts.length && j <= i; j++) {
                                // usersGained += financialItem.financialItemManualCosts[j].amount;
                                usersGained += 1;
                            }

                            // prevNetQuantityLastYearInFinancial += financialItem.financialItemManualCosts[i].amount;
                            prevNetQuantityLastYearInFinancial += 1;
                        }
                    }

                    console.log('financial usersLost=', usersLost, ' usersGained=', usersGained);
                    yearlyChurn = usersGained === 0 ? 0 : ((usersLost / usersGained) * 100.0);
                    yearlyChurnList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(yearlyChurn) : null);

                    // Multiple
                    const multiple = this.getMultiple(growth, grossMargin, yearlyChurn);
                    multipleList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(multiple) : null);

                    // MRR (Annualised)
                    const mrr = lastQuarter.grossIncome * 4;
                    mrrList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(mrr) : null);

                    // Value of Business
                    valueOfBusinessList.push(getValuationDto.valuationType === ValuationType.ARR ? Math.round(mrr * multiple) : null);
                }
            }
        }

        if (columnCount > 0) {
            valuation.push({
                name: columnName[0],
                data: yearsHeader.reduce((accumulator, year) => {
                    accumulator[year] = 'SaaS';
                    return accumulator;
                }, {}),
            });
            valuation.push({
                name: columnName[1],
                data: yearsHeader.reduce((accumulator, year) => {
                    accumulator[year] = 'ARR - MRR Annualised';
                    return accumulator;
                }, {}),
            });
        }

        for (let i = 0; i < 6; i++) {
            valuation.push({
                name: columnName[i + 2],
                data: yearsHeader.reduce((accumulator, year, currentIndex) => {
                    let value = allListMap[i][currentIndex];
                    accumulator[year] = `${value}`;
                    return accumulator;
                }, {}),
            })
        }

        return valuation;
    }


    public getMultiple(growthFloat: number, grossMarginFloat: number, monthlyChurnFloat: number): number {
        let multiple = 0;
        const growth = Math.round(growthFloat);
        const grossMargin = Math.round(grossMarginFloat);
        const monthlyChurn = Math.round(monthlyChurnFloat);

        if (growth <= 10 && grossMargin <= 60 && monthlyChurn >= 10) {
            multiple = 8;
        } else if (growth <= 10 && grossMargin <= 60 && monthlyChurn <= 10) {
            multiple = 10;
        } else if (growth <= 10 && grossMargin >= 60 && monthlyChurn >= 10) {
            multiple = 12;
        } else if (growth <= 10 && grossMargin >= 60 && monthlyChurn <= 10) {
            multiple = 10;
        } else if (growth >= 10 && grossMargin <= 60 && monthlyChurn >= 10) {
            multiple = 10;
        } else if (growth >= 10 && grossMargin <= 60 && monthlyChurn <= 10) {
            multiple = 12;
        } else if (growth >= 10 && grossMargin >= 60 && monthlyChurn >= 10) {
            multiple = 12;
        } else if (growth >= 10 && grossMargin >= 60 && monthlyChurn <= 10) {
            multiple = 14;
        }

        return multiple;
    }
}
