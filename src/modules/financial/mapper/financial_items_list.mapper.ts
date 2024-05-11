import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import {
    FinancialItemsListDto,
    FinancialItemsListItem,
    FinancialItemYear,
} from "../dto/response/financial_items_list.dto";
import { FinancialItemEntity } from "../entities/financial-item.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialQuarterRatioEntity } from "../entities/financial-quarter-ratio.entity";
import { BudgetItemsListDto, BudgetItemsListItem } from "src/modules/budget/budget-item/dto/response/budget_items_list.dto";

@Injectable()
export class FinancialItemsListMapper {
    fromEntityToDTO(
        destination: ClassType<FinancialItemsListDto>,
        sourceObjects: FinancialItemEntity[],
        quarterRatios: FinancialQuarterRatioEntity[],
        budgetItemsListDto: BudgetItemsListDto,
    ): FinancialItemsListDto {
        if (!sourceObjects) {
            return null;
        }

        // remove the total from the list of the numbers
        // revenue
        budgetItemsListDto.revenueGrossIncome.pop();

        // direct costs
        budgetItemsListDto.totalDirectCosts.pop();
        budgetItemsListDto.directCostsGrossMargin.pop();
        budgetItemsListDto.directCostsGrossMarginPercentage.pop();

        // personnel costs
        budgetItemsListDto.totalPersonnelCosts.pop();
        budgetItemsListDto.staffCostsPercentageRevenue.pop();

        // operating expenses
        budgetItemsListDto.totalOperatingExpenses.pop();
        budgetItemsListDto.operatingExpensesPercentage.pop();
        budgetItemsListDto.operatingExpensesEBITDA.pop();
        budgetItemsListDto.operatingExpensesEBITDAPercentage.pop();

        const itemsList: FinancialItemsListDto = {
            // revenue
            revenueItems: [],
            revenueGrossIncome: [],

            // direct costs
            directCostsItems: [],
            totalDirectCosts: [],
            directCostsGrossMargin: [],
            directCostsGrossMarginPercentage: [],

            // personnel costs
            personnelCostsItems: [],
            totalPersonnelCosts: [],
            staffCostsPercentageRevenue: [],

            // operating expenses
            operatingExpensesItems: [],
            totalOperatingExpenses: [],
            operatingExpensesPercentage: [],
            operatingExpensesEBITDA: [],
            operatingExpensesEBITDAPercentage: [],
        };

        let quartersNum = 0, yearsNum = 0;

        sourceObjects.forEach((obj) => {
            // sort by the date
            if (obj && obj.financialQuarters) {
                obj.financialQuarters.sort((a, b) => a.quarterDate.getTime() - b.quarterDate.getTime());
            }

            const newYear: FinancialItemYear = {
                year: 0,
                value: 0,
            };
            const item: FinancialItemsListItem = {
                financialItemId: obj.id,
                name: obj.item.name,
                quarters: [],
                years: [],
            };

            // add budget values first
            if (budgetItemsListDto && budgetItemsListDto.revenueItems && obj.item.budgetItem && obj.item.budgetItem.id) {
                let budgetItemsListItem: BudgetItemsListItem = null;
                if (obj.budgetCategory.type === BudgetCategory.REVENUE) {
                    budgetItemsListItem = budgetItemsListDto.revenueItems.find(e => e.budgetItemId === obj.item.budgetItem.id);
                } else if (obj.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
                    budgetItemsListItem = budgetItemsListDto.directCostsItems.find(e => e.budgetItemId === obj.item.budgetItem.id);
                } else if (obj.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS) {
                    budgetItemsListItem = budgetItemsListDto.personnelCostsItems.find(e => e.budgetItemId === obj.item.budgetItem.id);
                } else if (obj.budgetCategory.type === BudgetCategory.OPERATING_EXPENSES) {
                    budgetItemsListItem = budgetItemsListDto.operatingExpensesItems.find(e => e.budgetItemId === obj.item.budgetItem.id);
                }

                if (budgetItemsListItem && budgetItemsListItem.months && budgetItemsListItem.months.length > 0) {
                    let quarterDate = null;
                    let quarterNumber = 0;
                    let quarterValue = 0;
                    budgetItemsListItem.months.forEach((month, index) => {
                        quarterValue += month.value;
                        quarterDate = new Date(month.date);

                        if (index === 0) {
                            newYear.year = new Date(month.date).getFullYear();
                            newYear.value = month.value;
                        } else {
                            newYear.value += month.value;
                        }

                        if ((index > 0 && (index + 1) % 3 === 0) || (index === budgetItemsListItem.months.length - 1)) {
                            quarterNumber += 1;
                            item.quarters.push({
                                financialQuarterId: undefined,
                                date: quarterDate.toDateString(),
                                quarterNumber: quarterNumber,
                                value: quarterValue,
                            });
                            quarterDate = null;
                            quarterValue = 0;
                        }

                    });
                    item.years.push({ ...newYear });
                }
            }

            obj.financialQuarters.forEach((qu, index) => {
                if (qu.quarterNumber === 1) {
                    newYear.year = qu.quarterDate.getFullYear();
                    newYear.value = qu.value;
                } else if (qu.quarterNumber === 4 || index === obj.financialQuarters.length - 1) {
                    newYear.value += qu.value;
                    item.years.push({ ...newYear });
                } else {
                    newYear.value += qu.value;
                }

                item.quarters.push({
                    financialQuarterId: qu.id,
                    date: qu.quarterDate.toDateString(),
                    quarterNumber: qu.quarterNumber,
                    value: qu.value,
                });
            });
            if (obj.budgetCategory.type === BudgetCategory.REVENUE) {
                itemsList.revenueItems.push(item);
            } else if (obj.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
                itemsList.directCostsItems.push(item);
            } else if (obj.budgetCategory.type === BudgetCategory.PERSONNEL_COSTS) {
                itemsList.personnelCostsItems.push(item);
            } else if (obj.budgetCategory.type === BudgetCategory.OPERATING_EXPENSES) {
                itemsList.operatingExpensesItems.push(item);
            }
            quartersNum = item.quarters.length;
            yearsNum = item.years.length;
        });

        if (budgetItemsListDto && budgetItemsListDto.revenueGrossIncome && budgetItemsListDto.revenueGrossIncome.length > 0) {
            // add budget year ratios
            let sumGrossIncome = 0;
            let sumTotalDirectCosts = 0;
            let sumTotalPersonnelCosts = 0;
            let sumTotalOperatingExpenses = 0;
            if (budgetItemsListDto.revenueGrossIncome) {
                budgetItemsListDto.revenueGrossIncome.forEach(value => sumGrossIncome += value);
            }

            if (budgetItemsListDto.totalDirectCosts) {
                budgetItemsListDto.totalDirectCosts.forEach(value => sumTotalDirectCosts += value);
            }

            if (budgetItemsListDto.totalPersonnelCosts) {
                budgetItemsListDto.totalPersonnelCosts.forEach(value => sumTotalPersonnelCosts += value);
            }

            if (budgetItemsListDto.totalOperatingExpenses) {
                budgetItemsListDto.totalOperatingExpenses.forEach(value => sumTotalOperatingExpenses += value);
            }

            // revenue
            itemsList.revenueGrossIncome.push(sumGrossIncome);

            // direct costs
            itemsList.totalDirectCosts.push(sumTotalDirectCosts);
            const sumGrossMargin = sumGrossIncome - sumTotalDirectCosts;
            itemsList.directCostsGrossMargin.push(sumGrossMargin);
            itemsList.directCostsGrossMarginPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumGrossMargin / sumGrossIncome)));

            // personnel costs
            itemsList.totalPersonnelCosts.push(sumTotalPersonnelCosts);
            itemsList.staffCostsPercentageRevenue.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalPersonnelCosts / sumGrossIncome)));
            
            // operating expenses
            itemsList.totalOperatingExpenses.push(sumTotalOperatingExpenses);
            itemsList.operatingExpensesPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalOperatingExpenses / sumGrossIncome)));
            const sumEBITDA = sumGrossMargin - sumTotalPersonnelCosts - sumTotalOperatingExpenses;
            itemsList.operatingExpensesEBITDA.push(sumEBITDA);
            itemsList.operatingExpensesEBITDAPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumEBITDA / sumGrossIncome)));
        }

        if (quartersNum + yearsNum > 0) {
            // added years ratios
            let numberOfQuarters = 0;
            let sumGrossIncome = 0;
            let sumTotalDirectCosts = 0;
            let sumTotalPersonnelCosts = 0;
            let sumTotalOperatingExpenses = 0;

            quarterRatios.forEach(qr => {
                numberOfQuarters += 1;

                sumGrossIncome += qr.grossIncome;
                sumTotalDirectCosts += qr.totalDirectCosts;
                sumTotalPersonnelCosts += qr.totalPersonnelCosts;
                sumTotalOperatingExpenses += qr.totalOperatingExpenses;

                if (numberOfQuarters === 4) {
                    // revenue
                    itemsList.revenueGrossIncome.push(sumGrossIncome);

                    // direct costs
                    itemsList.totalDirectCosts.push(sumTotalDirectCosts);
                    let sumGrossMargin = sumGrossIncome - sumTotalDirectCosts;
                    itemsList.directCostsGrossMargin.push(sumGrossMargin);
                    itemsList.directCostsGrossMarginPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumGrossMargin / sumGrossIncome)));

                    // personnel costs
                    itemsList.totalPersonnelCosts.push(sumTotalPersonnelCosts);
                    itemsList.staffCostsPercentageRevenue.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalPersonnelCosts / sumGrossIncome)));
                    
                    // operating expenses
                    itemsList.totalOperatingExpenses.push(sumTotalOperatingExpenses);
                    itemsList.operatingExpensesPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalOperatingExpenses / sumGrossIncome)));
                    let sumEBITDA = sumGrossMargin - sumTotalPersonnelCosts - sumTotalOperatingExpenses;
                    itemsList.operatingExpensesEBITDA.push(sumEBITDA);
                    itemsList.operatingExpensesEBITDAPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumEBITDA / sumGrossIncome)));

                    numberOfQuarters = 0;
                    sumGrossIncome = 0;
                    sumTotalDirectCosts = 0;
                    sumTotalPersonnelCosts = 0;
                    sumTotalOperatingExpenses = 0;
                }
            });

            // add quarter budget ratios
            if (budgetItemsListDto && budgetItemsListDto.revenueGrossIncome && budgetItemsListDto.revenueGrossIncome.length > 0) {
                sumGrossIncome = 0;
                sumTotalDirectCosts = 0;
                sumTotalPersonnelCosts = 0;
                sumTotalOperatingExpenses = 0;
                for (let i = 0; i < budgetItemsListDto.revenueGrossIncome.length; i++) {
                    sumGrossIncome += budgetItemsListDto.revenueGrossIncome[i];
                    sumTotalDirectCosts += budgetItemsListDto.totalDirectCosts[i];
                    sumTotalPersonnelCosts += budgetItemsListDto.totalPersonnelCosts[i];
                    sumTotalOperatingExpenses += budgetItemsListDto.totalOperatingExpenses[i];

                    if ((i > 0 && (i + 1) % 3 === 0) || (i === budgetItemsListDto.revenueGrossIncome.length - 1)) {
                        // revenue
                        itemsList.revenueGrossIncome.push(sumGrossIncome);

                        // direct costs
                        itemsList.totalDirectCosts.push(sumTotalDirectCosts);
                        let sumGrossMargin = sumGrossIncome - sumTotalDirectCosts;
                        itemsList.directCostsGrossMargin.push(sumGrossMargin);
                        itemsList.directCostsGrossMarginPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumGrossMargin / sumGrossIncome)));

                        // personnel costs
                        itemsList.totalPersonnelCosts.push(sumTotalPersonnelCosts);
                        itemsList.staffCostsPercentageRevenue.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalPersonnelCosts / sumGrossIncome)));
                        
                        // operating expenses
                        itemsList.totalOperatingExpenses.push(sumTotalOperatingExpenses);
                        itemsList.operatingExpensesPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumTotalOperatingExpenses / sumGrossIncome)));
                        let sumEBITDA = sumGrossMargin - sumTotalPersonnelCosts - sumTotalOperatingExpenses;
                        itemsList.operatingExpensesEBITDA.push(sumEBITDA);
                        itemsList.operatingExpensesEBITDAPercentage.push(100.0 * (sumGrossIncome == 0 ? 0 : (sumEBITDA / sumGrossIncome)));

                        sumGrossIncome = 0;
                        sumTotalDirectCosts = 0;
                        sumTotalPersonnelCosts = 0;
                        sumTotalOperatingExpenses = 0;
                    }
                }
            }

            // added quarter ratios
            quarterRatios.forEach(qr => {
                // revenue
                itemsList.revenueGrossIncome.push(qr.grossIncome);

                // direct costs
                itemsList.totalDirectCosts.push(qr.totalDirectCosts);
                itemsList.directCostsGrossMargin.push(qr.grossMargin);
                itemsList.directCostsGrossMarginPercentage.push(qr.grossMarginPercentage);

                // personnel costs
                itemsList.totalPersonnelCosts.push(qr.totalPersonnelCosts);
                itemsList.staffCostsPercentageRevenue.push(
                    !!qr.grossIncome ? (qr.totalPersonnelCosts / qr.grossIncome) * 100.0 : 0,
                );

                // operating expenses
                itemsList.totalOperatingExpenses.push(qr.totalOperatingExpenses);
                itemsList.operatingExpensesPercentage.push(
                    !!qr.grossIncome ? (qr.totalOperatingExpenses / qr.grossIncome) * 100.0 : 0,
                );
                itemsList.operatingExpensesEBITDA.push(qr.ebitda);
                itemsList.operatingExpensesEBITDAPercentage.push(qr.ebitdaPercentage);
            });
        }

        return itemsList;
    }
}
