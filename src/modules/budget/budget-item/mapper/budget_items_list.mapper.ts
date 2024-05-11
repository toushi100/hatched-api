import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { BudgetItemsListDto, BudgetItemsListItem } from "../dto/response/budget_items_list.dto";
import { BudgetItemEntity } from "../entities/budget-item.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { BudgetMonthRatioEntity } from "../entities/budget-month-ratio.entity";

@Injectable()
export class BudgetItemsListMapper {
    fromEntityToDTO(
        destination: ClassType<BudgetItemsListDto>,
        sourceObjects: BudgetItemEntity[],
        monthRatios: BudgetMonthRatioEntity[],
    ): BudgetItemsListDto {
        if (!sourceObjects) {
            return null;
        }

        const itemsList: BudgetItemsListDto = {
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

        let monthsNum = 0;

        sourceObjects.forEach((obj) => {
            // sort by the date
            if (obj && obj.budgetMonths) {
                obj.budgetMonths.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime());
            }

            const item: BudgetItemsListItem = {
                budgetItemId: obj.id,
                name: obj.item.name,
                months: [],
                total: 0,
            };

            obj.budgetMonths.forEach((month) => {
                item.months.push({
                    budgetItemMonthId: month.id,
                    date: month.monthDate.toDateString(),
                    monthNumber: month.monthNumber,
                    value: month.value,
                });
                item.total += month.value;
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

            monthsNum = item.months.length;
        });


        if (monthsNum > 0) {
            // added month ratios
            monthRatios.forEach(mr => {
                // revenue
                itemsList.revenueGrossIncome.push(mr.grossIncome);

                // direct costs
                itemsList.totalDirectCosts.push(mr.totalDirectCosts);
                itemsList.directCostsGrossMargin.push(mr.grossMargin);
                itemsList.directCostsGrossMarginPercentage.push(mr.grossMarginPercentage);

                // personnel costs
                itemsList.totalPersonnelCosts.push(mr.totalPersonnelCosts);
                itemsList.staffCostsPercentageRevenue.push(
                    !!mr.grossIncome ? Number(((mr.totalPersonnelCosts / mr.grossIncome) * 100.0).toFixed(2)) : 0,
                );

                // operating expenses
                itemsList.totalOperatingExpenses.push(mr.totalOperatingExpenses);
                itemsList.operatingExpensesPercentage.push(
                    !!mr.grossIncome ? Number(((mr.totalOperatingExpenses / mr.grossIncome) * 100.0).toFixed(2)) : 0,
                );
                itemsList.operatingExpensesEBITDA.push(mr.ebitda);
                itemsList.operatingExpensesEBITDAPercentage.push(mr.ebitdaPercentage);
            });

            // add totals
            const revenueGrossIncomeSum = itemsList.revenueGrossIncome.reduce((a, i) => a + i, 0);
            itemsList.revenueGrossIncome.push(revenueGrossIncomeSum);

            const totalDirectCostsSum = itemsList.totalDirectCosts.reduce((a, i) => a + i, 0);
            itemsList.totalDirectCosts.push(totalDirectCostsSum);

            const directCostsGrossMarginSum = itemsList.directCostsGrossMargin.reduce((a, i) => a + i, 0);
            itemsList.directCostsGrossMargin.push(directCostsGrossMarginSum);

            const directCostsGrossMarginPercentageSum = itemsList.directCostsGrossMarginPercentage.reduce(
                (a, i) => a + i,
                0,
            );
            const directCostsGrossMarginPercentageAvg = itemsList.directCostsGrossMarginPercentage.length
                ? directCostsGrossMarginPercentageSum / itemsList.directCostsGrossMarginPercentage.length
                : directCostsGrossMarginPercentageSum;
            itemsList.directCostsGrossMarginPercentage.push(directCostsGrossMarginPercentageAvg);

            const totalPersonnelCostsSum = itemsList.totalPersonnelCosts.reduce((a, i) => a + i, 0);
            itemsList.totalPersonnelCosts.push(totalPersonnelCostsSum);

            const staffCostsPercentageRevenueSum = itemsList.staffCostsPercentageRevenue.reduce((a, i) => a + i, 0);
            const staffCostsPercentageRevenueAvg = itemsList.staffCostsPercentageRevenue.length
                ? staffCostsPercentageRevenueSum / itemsList.staffCostsPercentageRevenue.length
                : staffCostsPercentageRevenueSum;
            itemsList.staffCostsPercentageRevenue.push(staffCostsPercentageRevenueAvg);

            const totalOperatingExpensesSum = itemsList.totalOperatingExpenses.reduce((a, i) => a + i, 0);
            itemsList.totalOperatingExpenses.push(totalOperatingExpensesSum);

            const operatingExpensesPercentageSum = itemsList.operatingExpensesPercentage.reduce((a, i) => a + i, 0);
            const operatingExpensesPercentageAvg = itemsList.operatingExpensesPercentage.length
                ? operatingExpensesPercentageSum / itemsList.operatingExpensesPercentage.length
                : operatingExpensesPercentageSum;
            itemsList.operatingExpensesPercentage.push(operatingExpensesPercentageAvg);

            const operatingExpensesEBITDASum = itemsList.operatingExpensesEBITDA.reduce((a, i) => a + i, 0);
            itemsList.operatingExpensesEBITDA.push(operatingExpensesEBITDASum);

            const operatingExpensesEBITDAPercentageSum = itemsList.operatingExpensesEBITDAPercentage.reduce(
                (a, i) => a + i,
                0,
            );
            const operatingExpensesEBITDAPercentageAvg = itemsList.operatingExpensesEBITDAPercentage.length
                ? operatingExpensesEBITDAPercentageSum / itemsList.operatingExpensesEBITDAPercentage.length
                : operatingExpensesEBITDAPercentageSum;
            itemsList.operatingExpensesEBITDAPercentage.push(operatingExpensesEBITDAPercentageAvg);
        }

        return itemsList;
    }
}
