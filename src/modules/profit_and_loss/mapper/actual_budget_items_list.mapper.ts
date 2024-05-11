import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { ActualBudgetItemsListDto, ActualBudgetItemsListItem } from "../dto/response/actual_budget_items_list.dto";
import { ActualBudgetItemEntity } from "../entities/actual-budget-item.entity";
import { ActualBudgetMonthRatioEntity } from "../entities/actual-budget-month-ratio.entity";
import { BudgetCategory } from "../../../modules/budget/budget-category/types/budget_category.enum";
import {
    BudgetItemsListDto,
    BudgetItemsListItem,
} from "src/modules/budget/budget-item/dto/response/budget_items_list.dto";

@Injectable()
export class ActualBudgetItemsListMapper {
    fromEntityToDTO(
        destination: ClassType<ActualBudgetItemsListDto>,
        sourceObjects: ActualBudgetItemEntity[],
        monthRatios: ActualBudgetMonthRatioEntity[],
        budgetItemsListDto: BudgetItemsListDto,
    ): ActualBudgetItemsListDto {
        if (!sourceObjects) {
            return null;
        }
        let indexOfLastActualBudgetMonthImported: number = -1;

        const itemsList: ActualBudgetItemsListDto = {
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
            if (obj && obj.actualBudgetMonths) {
                obj.actualBudgetMonths.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime());

                obj.actualBudgetMonths.forEach((month, index) => {
                    if (month.value > 0 && index > indexOfLastActualBudgetMonthImported)
                        indexOfLastActualBudgetMonthImported = index;
                });
            }

            const item: ActualBudgetItemsListItem = {
                actualBudgetItemId: obj.id,
                name: obj.item.name,
                months: [],
                profitAndLossItems: [],
            };

            obj.actualBudgetMonths.forEach((qu, index) => {
                item.months.push({
                    actualBudgetItemMonthId: qu.id,
                    date: qu.monthDate.toDateString(),
                    monthNumber: qu.monthNumber,
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

            monthsNum = item.months.length;
        });


        if (monthsNum > 0) {
            // added month ratios
            monthRatios.forEach((qr) => {
                // revenue
                itemsList.revenueGrossIncome.push(qr.grossIncome);

                // direct costs
                itemsList.totalDirectCosts.push(qr.totalDirectCosts);
                itemsList.directCostsGrossMargin.push(qr.grossMargin);
                itemsList.directCostsGrossMarginPercentage.push(qr.grossMarginPercentage);

                // personnel costs
                itemsList.totalPersonnelCosts.push(qr.totalPersonnelCosts);
                itemsList.staffCostsPercentageRevenue.push(
                    !!qr.grossIncome ? Number(((qr.totalPersonnelCosts / qr.grossIncome) * 100.0).toFixed(2)) : 0,
                );

                // operating expenses
                itemsList.totalOperatingExpenses.push(qr.totalOperatingExpenses);
                itemsList.operatingExpensesPercentage.push(
                    !!qr.grossIncome ? Number(((qr.totalOperatingExpenses / qr.grossIncome) * 100.0).toFixed(2)) : 0,
                );
                itemsList.operatingExpensesEBITDA.push(qr.ebitda);
                itemsList.operatingExpensesEBITDAPercentage.push(qr.ebitdaPercentage);
            });
        }


        // added YTD, Monthly Variance , %, Actual v Budget Monthly and Actual v Budget YTD
        const profitAndLossNames = ['YTD', 'Monthly Variance', '%', 'Actual v Budget Monthly', 'Actual v Budget YTD'];
        if (indexOfLastActualBudgetMonthImported !== -1) {
            // revenue
            this.handleBudgetItems(itemsList.revenueItems, budgetItemsListDto.revenueItems, indexOfLastActualBudgetMonthImported);
            this.handleBudgetTotalItems(itemsList.revenueItems, itemsList.revenueGrossIncome, budgetItemsListDto.revenueGrossIncome, indexOfLastActualBudgetMonthImported);

            // direct costs
            this.handleBudgetItems(itemsList.directCostsItems, budgetItemsListDto.directCostsItems, indexOfLastActualBudgetMonthImported);
            this.handleBudgetTotalItems(itemsList.directCostsItems, itemsList.totalDirectCosts, budgetItemsListDto.totalDirectCosts, indexOfLastActualBudgetMonthImported);
            this.handleBudgetGrossMargin(itemsList.revenueGrossIncome, itemsList.totalDirectCosts, itemsList.directCostsGrossMargin, itemsList.directCostsGrossMarginPercentage);

            // personnel costs
            this.handleBudgetItems(itemsList.personnelCostsItems, budgetItemsListDto.personnelCostsItems, indexOfLastActualBudgetMonthImported);
            this.handleBudgetTotalItems(itemsList.personnelCostsItems, itemsList.totalPersonnelCosts, budgetItemsListDto.totalPersonnelCosts, indexOfLastActualBudgetMonthImported);
            this.handleBudgetPercentageItems(itemsList.revenueGrossIncome, itemsList.totalPersonnelCosts, itemsList.staffCostsPercentageRevenue);

            // operating expenses
            this.handleBudgetItems(itemsList.operatingExpensesItems, budgetItemsListDto.operatingExpensesItems, indexOfLastActualBudgetMonthImported);
            this.handleBudgetTotalItems(itemsList.operatingExpensesItems, itemsList.totalOperatingExpenses, budgetItemsListDto.totalOperatingExpenses, indexOfLastActualBudgetMonthImported);
            this.handleBudgetPercentageItems(itemsList.revenueGrossIncome, itemsList.totalOperatingExpenses, itemsList.operatingExpensesPercentage);
            this.handleBudgetEBITDA(itemsList);

        } else {
            itemsList.revenueItems.forEach(item => {
                profitAndLossNames.forEach((pl, index) => {
                    item.profitAndLossItems.splice(index, 0, {
                        name: pl,
                        value: 0,
                    });
                });
            });
            if (itemsList.revenueGrossIncome.length > 0) {
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.revenueGrossIncome.splice(index, 0, 0);
                });
            }

            // direct costs
            itemsList.directCostsItems.forEach(item => {
                profitAndLossNames.forEach((pl, index) => {
                    item.profitAndLossItems.splice(index, 0, {
                        name: pl,
                        value: 0,
                    });
                });
            });
            if (itemsList.totalDirectCosts.length > 0) {
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.totalDirectCosts.splice(index, 0, 0);
                });
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.directCostsGrossMargin.splice(index, 0, 0);
                });

                profitAndLossNames.forEach((pl, index) => {
                    itemsList.directCostsGrossMarginPercentage.splice(index, 0, 0);
                });
            }

            // personnel costs
            itemsList.personnelCostsItems.forEach(item => {
                profitAndLossNames.forEach((pl, index) => {
                    item.profitAndLossItems.splice(index, 0, {
                        name: pl,
                        value: 0,
                    });
                });
            });
            if (itemsList.totalPersonnelCosts.length > 0) {
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.totalPersonnelCosts.splice(index, 0, 0);
                });
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.staffCostsPercentageRevenue.splice(index, 0, 0);
                });
            }

            // operating expenses
            itemsList.operatingExpensesItems.forEach(item => {
                profitAndLossNames.forEach((pl, index) => {
                    item.profitAndLossItems.splice(index, 0, {
                        name: pl,
                        value: 0,
                    });
                });
            });
            if (itemsList.totalOperatingExpenses.length > 0) {
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.totalOperatingExpenses.splice(index, 0, 0);
                });
                profitAndLossNames.forEach((pl, index) => {
                    itemsList.operatingExpensesPercentage.splice(index, 0, 0);
                });

                profitAndLossNames.forEach((pl, index) => {
                    itemsList.operatingExpensesEBITDA.splice(index, 0, 0);
                });

                profitAndLossNames.forEach((pl, index) => {
                    itemsList.operatingExpensesEBITDAPercentage.splice(index, 0, 0);
                });
            }
        }

        return itemsList;
    }

    private handleBudgetItems(
        currentList: ActualBudgetItemsListItem[],
        budgetList: BudgetItemsListItem[],
        indexOfLastActualBudgetMonthImported: number,
    ): void {
        const profitAndLossNames = ['YTD', 'Monthly Variance', '%', 'Actual v Budget Monthly', 'Actual v Budget YTD'];
        currentList.forEach((item, itemIndex) => {
            let budgetYTD = 0;
            let ytd = 0;
            let monthlyVariance = 0;
            let monthlyVariancePercent = 0;
            let actualVBudgetMonthly = 0;
            let actualVBudgetYTD = 0;
            for (let i = 0; i <= indexOfLastActualBudgetMonthImported; i++) {
                ytd += item.months[i].value;
                budgetYTD += budgetList[itemIndex].months[i].value;
            }

            if (indexOfLastActualBudgetMonthImported > 0) {
                monthlyVariance = item.months[indexOfLastActualBudgetMonthImported].value - item.months[indexOfLastActualBudgetMonthImported - 1].value;
                monthlyVariancePercent = item.months[indexOfLastActualBudgetMonthImported - 1].value === 0 ? 0 : Math.round((monthlyVariance / item.months[indexOfLastActualBudgetMonthImported - 1].value) * 100.0);
            }

            actualVBudgetMonthly = item.months[indexOfLastActualBudgetMonthImported].value - budgetList[itemIndex].months[indexOfLastActualBudgetMonthImported].value;
            actualVBudgetYTD = ytd - budgetYTD;

            item.profitAndLossItems.splice(0, 0, {
                name: profitAndLossNames[0],
                value: ytd,
            });

            item.profitAndLossItems.splice(1, 0, {
                name: profitAndLossNames[1],
                value: monthlyVariance,
            });

            item.profitAndLossItems.splice(2, 0, {
                name: profitAndLossNames[2],
                value: monthlyVariancePercent,
            });

            item.profitAndLossItems.splice(3, 0, {
                name: profitAndLossNames[3],
                value: actualVBudgetMonthly,
            });

            item.profitAndLossItems.splice(4, 0, {
                name: profitAndLossNames[4],
                value: actualVBudgetYTD,
            });
        });
    }


    private handleBudgetTotalItems(
        currentList: ActualBudgetItemsListItem[],
        totalList: number[],
        budgetTotalList: number[],
        indexOfLastActualBudgetMonthImported: number,
    ): void {
        let ytd = 0;
        let monthlyVariance = 0;
        let monthlyVariancePercent = 0;
        let actualVBudgetMonthly = 0;
        let actualVBudgetYTD = 0;

        currentList.forEach(item => {
            ytd += item.profitAndLossItems[0].value; // YTD
            monthlyVariance += item.profitAndLossItems[1].value; // Monthly Variance
            monthlyVariancePercent += item.profitAndLossItems[2].value; // %
            actualVBudgetMonthly += item.profitAndLossItems[3].value; // Actual v Budget Monthly
            actualVBudgetYTD += item.profitAndLossItems[4].value; // Actual v Budget YTD
        });

        if (currentList.length > 0) {
            monthlyVariancePercent = Math.round(monthlyVariancePercent / currentList.length);
        }

        if (totalList.length > 0) {
            totalList.splice(0, 0, ytd);
            totalList.splice(1, 0, monthlyVariance);
            totalList.splice(2, 0, monthlyVariancePercent);
            totalList.splice(3, 0, actualVBudgetMonthly);
            totalList.splice(4, 0, actualVBudgetYTD);
        }
    }

    private handleBudgetGrossMargin(
        revenueGrossIncome: number[],
        totalDirectCosts: number[],
        directCostsGrossMargin: number[],
        directCostsGrossMarginPercentage: number[],
    ): void {
        let ytdGrossMargin = revenueGrossIncome[0] - totalDirectCosts[0];
        let monthlyVarianceGrossMargin = revenueGrossIncome[1] - totalDirectCosts[1];
        let monthlyVariancePercentGrossMargin = revenueGrossIncome[2] - totalDirectCosts[2];
        let actualVBudgetMonthlyGrossMargin = revenueGrossIncome[3] - totalDirectCosts[3];
        let actualVBudgetYTDGrossMargin = revenueGrossIncome[4] - totalDirectCosts[4];

        directCostsGrossMargin.splice(0, 0, ytdGrossMargin);
        directCostsGrossMargin.splice(1, 0, monthlyVarianceGrossMargin);
        directCostsGrossMargin.splice(2, 0, monthlyVariancePercentGrossMargin);
        directCostsGrossMargin.splice(3, 0, actualVBudgetMonthlyGrossMargin);
        directCostsGrossMargin.splice(4, 0, actualVBudgetYTDGrossMargin);

        let ytdGrossMarginPercentage = revenueGrossIncome[0] === 0 ? 0 : Math.round((ytdGrossMargin / revenueGrossIncome[0]) * 100.0);
        let monthlyVarianceGrossMarginPercentage = revenueGrossIncome[1] === 0 ? 0 : Math.round((monthlyVarianceGrossMargin / revenueGrossIncome[1]) * 100.0);
        let monthlyVariancePercentGrossMarginPercentage = monthlyVariancePercentGrossMargin;
        let actualVBudgetMonthlyGrossMarginPercentage = revenueGrossIncome[3] === 0 ? 0 : Math.round((actualVBudgetMonthlyGrossMargin / revenueGrossIncome[3]) * 100.0);
        let actualVBudgetYTDGrossMarginPercentage = revenueGrossIncome[4] === 0 ? 0 : Math.round((actualVBudgetYTDGrossMargin / revenueGrossIncome[4]) * 100.0);

        directCostsGrossMarginPercentage.splice(0, 0, ytdGrossMarginPercentage);
        directCostsGrossMarginPercentage.splice(1, 0, monthlyVarianceGrossMarginPercentage);
        directCostsGrossMarginPercentage.splice(2, 0, monthlyVariancePercentGrossMarginPercentage);
        directCostsGrossMarginPercentage.splice(3, 0, actualVBudgetMonthlyGrossMarginPercentage);
        directCostsGrossMarginPercentage.splice(4, 0, actualVBudgetYTDGrossMarginPercentage);
    }

    private handleBudgetPercentageItems(
        revenueGrossIncome: number[],
        totalList: number[],
        percentagesList: number[],
    ): void {
        const ytd = totalList[0];
        const monthlyVariance = totalList[1];
        const monthlyVariancePercentage = totalList[2];
        const actualVBudgetMonthly = totalList[3];
        const actualVBudgetYTD = totalList[4];

        const ytdPercentage = !!revenueGrossIncome[0] ? Math.round((ytd / revenueGrossIncome[0]) * 100.0) : 0;
        const monthlyVarianceGrossMarginPercentage = !!revenueGrossIncome[1]
            ? Math.round((monthlyVariance / revenueGrossIncome[1]) * 100.0)
            : 0;
        const actualVBudgetMonthlyGrossMarginPercentage = !!revenueGrossIncome[3]
            ? Math.round((actualVBudgetMonthly / revenueGrossIncome[3]) * 100.0)
            : 0;
        const actualVBudgetYTDGrossMarginPercentage = !!revenueGrossIncome[4]
            ? Math.round((actualVBudgetYTD / revenueGrossIncome[4]) * 100.0)
            : 0;

        percentagesList.splice(0, 0, ytdPercentage);
        percentagesList.splice(1, 0, monthlyVarianceGrossMarginPercentage);
        percentagesList.splice(2, 0, monthlyVariancePercentage);
        percentagesList.splice(3, 0, actualVBudgetMonthlyGrossMarginPercentage);
        percentagesList.splice(4, 0, actualVBudgetYTDGrossMarginPercentage);
    }

    private handleBudgetEBITDA(
        itemsList: ActualBudgetItemsListDto,
    ): void {
        let ytdOperatingExpensesEBITDA = itemsList.directCostsGrossMargin[0] - itemsList.totalPersonnelCosts[0] - itemsList.totalOperatingExpenses[0];
        let monthlyVarianceOperatingExpensesEBITDA = itemsList.directCostsGrossMargin[1] - itemsList.totalPersonnelCosts[1] - itemsList.totalOperatingExpenses[1];
        let monthlyVariancePercentOperatingExpensesEBITDA = itemsList.directCostsGrossMargin[2] - itemsList.totalPersonnelCosts[2] - itemsList.totalOperatingExpenses[2];
        let actualVBudgetMonthlyOperatingExpensesEBITDA = itemsList.directCostsGrossMargin[3] - itemsList.totalPersonnelCosts[3] - itemsList.totalOperatingExpenses[3];
        let actualVBudgetYTDOperatingExpensesEBITDA = itemsList.directCostsGrossMargin[4] - itemsList.totalPersonnelCosts[4] - itemsList.totalOperatingExpenses[4];

        itemsList.operatingExpensesEBITDA.splice(0, 0, ytdOperatingExpensesEBITDA);
        itemsList.operatingExpensesEBITDA.splice(1, 0, monthlyVarianceOperatingExpensesEBITDA);
        itemsList.operatingExpensesEBITDA.splice(2, 0, monthlyVariancePercentOperatingExpensesEBITDA);
        itemsList.operatingExpensesEBITDA.splice(3, 0, actualVBudgetMonthlyOperatingExpensesEBITDA);
        itemsList.operatingExpensesEBITDA.splice(4, 0, actualVBudgetYTDOperatingExpensesEBITDA);

        let ytdOperatingExpensesEBITDAPercentage = itemsList.revenueGrossIncome[0] === 0 ? 0 : Math.round((ytdOperatingExpensesEBITDA / itemsList.revenueGrossIncome[0]) * 100.0);
        let monthlyVarianceOperatingExpensesEBITDAPercentage = itemsList.revenueGrossIncome[1] === 0 ? 0 : Math.round((monthlyVarianceOperatingExpensesEBITDA / itemsList.revenueGrossIncome[1]) * 100.0);
        let monthlyVariancePercentOperatingExpensesEBITDAPercentage = monthlyVariancePercentOperatingExpensesEBITDA;
        let actualVBudgetMonthlyOperatingExpensesEBITDAPercentage = itemsList.revenueGrossIncome[3] === 0 ? 0 : Math.round((actualVBudgetMonthlyOperatingExpensesEBITDA / itemsList.revenueGrossIncome[3]) * 100.0);
        let actualVBudgetYTDOperatingExpensesEBITDAPercentage = itemsList.revenueGrossIncome[4] === 0 ? 0 : Math.round((actualVBudgetYTDOperatingExpensesEBITDA / itemsList.revenueGrossIncome[4]) * 100.0);

        itemsList.operatingExpensesEBITDAPercentage.splice(0, 0, ytdOperatingExpensesEBITDAPercentage);
        itemsList.operatingExpensesEBITDAPercentage.splice(1, 0, monthlyVarianceOperatingExpensesEBITDAPercentage);
        itemsList.operatingExpensesEBITDAPercentage.splice(2, 0, monthlyVariancePercentOperatingExpensesEBITDAPercentage);
        itemsList.operatingExpensesEBITDAPercentage.splice(3, 0, actualVBudgetMonthlyOperatingExpensesEBITDAPercentage);
        itemsList.operatingExpensesEBITDAPercentage.splice(4, 0, actualVBudgetYTDOperatingExpensesEBITDAPercentage);
    }
}
