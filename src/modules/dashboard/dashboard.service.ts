import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
    DashboardFinancialNumbersDto,
    FinancialActualVsBudgetDto,
    FinancialNumbersAndChartsDto,
    FinancialPLBreakdownDto,
    FinancialSalesComponentsDto,
} from "./dto/response/financial.dtos";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyService } from "../company/services/company.service";
import {
    DashboardHRNumbersDto,
    HRActualVsBudgetDto,
    HRNumbersAndChartsDto,
    HRStaffCostsAvg4MonthsDto,
    HRStaffCostsYTDDto,
} from "./dto/response/hr.dtos";
import { CaptableService } from "../captable/captable.service";
import { ValuationService } from "../valuation/valuation.service";
import { BudgetItemService } from "../budget/budget-item/services/budget-item.service";
import { ProfitLossService } from "../profit_and_loss/services/profit-loss.service";
import { languagesCodes } from "src/constants/languages";
import { ValuationType } from "../valuation/types/valuation_type.enum";
import {
    ActualBudgetItemsListDto,
    ActualBudgetItemsListItem,
} from "../profit_and_loss/dto/response/actual_budget_items_list.dto";
import { ChartDataSetsItem } from "./dto/response/abstract-chart-data.dto";
import { DashboardKeys } from "./translate.enum";
import { CompanyEntity } from "../company/entities/company.entity";
import { BudgetItemsListDto } from "../budget/budget-item/dto/response/budget_items_list.dto";

@Injectable()
export class DashboardService {
    constructor(
        private readonly i18n: I18nService,
        public readonly companyService: CompanyService,
        public readonly valuationService: ValuationService,
        public readonly budgetItemService: BudgetItemService,
        public readonly captableService: CaptableService,
        public readonly profitLossService: ProfitLossService,
    ) {}

    private getLastUpdatedMonthIndex(budgetItems: ActualBudgetItemsListItem[]): number {
        let lastMonthIndex = 0;
        budgetItems.forEach((item) => {
            item.months.forEach((month, index) => {
                if (month.value > 0 && index > lastMonthIndex) lastMonthIndex = index;
            });
        });
        return lastMonthIndex;
    }

    public async getCompanyFinancialNumbersAndCharts(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<FinancialNumbersAndChartsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const estimatedBudgetItems = await this.budgetItemService.getBudgetItems(userPayload);
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const chartMonthsLabels = actualBudgetItems.revenueItems[0]?.months.map((monthDate) =>
                monthDate.date.substring(4, 7),
            );

            const numbers = await this.mapCompanyFinancialNumbers(company, actualBudgetItems, languageCode);

            const actualVsBudgetChart = await this.mapFinancialActualVsBudgetChartData(
                estimatedBudgetItems,
                actualBudgetItems,
                chartMonthsLabels,
                languageCode,
            );
            const plBreakdownChart = await this.mapFinancialPLBreakdownChartData(
                actualBudgetItems,
                chartMonthsLabels,
                languageCode,
            );
            const salesComponentsChart = await this.mapFinancialSalesComponentsChartData(
                actualBudgetItems,
                chartMonthsLabels,
                languageCode,
            );

            return {
                numbers,
                actualVsBudgetChart,
                plBreakdownChart,
                salesComponentsChart,
            };
        } catch (e) {
            console.log(`Can't get company's financial numbers or charts data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.FINANCIAL_NUMBERS_AND_CHARTS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyHRNumbersAndCharts(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<HRNumbersAndChartsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const estimatedBudgetItems = await this.budgetItemService.getBudgetItems(userPayload);
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const lastMonthIndex = this.getLastUpdatedMonthIndex(actualBudgetItems.personnelCostsItems);
            const chartsStaffLabels = actualBudgetItems.personnelCostsItems.map((item) => item.name);

            const numbers = await this.mapCompanyHRNumbers(actualBudgetItems, lastMonthIndex, languageCode);
            const staffCostsYTDChart = await this.mapHRStaffCostsYTDChartData(
                actualBudgetItems,
                lastMonthIndex,
                chartsStaffLabels,
                languageCode,
            );
            const staffCostsAvg4MonthsChart = await this.mapHRStaffCostsAvg4MonthsChartData(
                actualBudgetItems,
                lastMonthIndex,
                chartsStaffLabels,
                languageCode,
            );
            const actualVsBudgetChart = await this.mapHRActualVsBudgetChartData(
                estimatedBudgetItems,
                actualBudgetItems,
                lastMonthIndex,
                chartsStaffLabels,
                languageCode,
            );

            return {
                numbers,
                staffCostsYTDChart,
                staffCostsAvg4MonthsChart,
                actualVsBudgetChart,
            };
        } catch (e) {
            console.log(`Can't get company's HR numbers or charts data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.HR_NUMBERS_AND_CHARTS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyFinancialNumbers(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<DashboardFinancialNumbersDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const financialNumbers = await this.mapCompanyFinancialNumbers(company, actualBudgetItems, languageCode);
            return financialNumbers;
        } catch (e) {
            throw e;
        }
    }

    public async mapCompanyFinancialNumbers(
        company: CompanyEntity,
        actualBudgetItems: ActualBudgetItemsListDto,
        language: string,
    ): Promise<DashboardFinancialNumbersDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            // get company value
            const valuationData = await this.valuationService.getCompanyValuationData(
                company.id,
                { valuationType: ValuationType.ARR },
                languageCode,
            );
            const valueOfBusiness = valuationData.find((item) => item.name === "Value of Business");
            let companyValue = 0;
            if (Object.keys(valueOfBusiness.data).length) {
                const years = Object.keys(valueOfBusiness.data).map(Number);
                const firstYear = Math.min(...years);
                companyValue = Number(valueOfBusiness.data[firstYear]);
            }

            // get total revenues and EBITDA
            const lastMonthIndex = this.getLastUpdatedMonthIndex([
                ...actualBudgetItems.revenueItems,
                ...actualBudgetItems.directCostsItems,
                ...actualBudgetItems.operatingExpensesItems,
                ...actualBudgetItems.personnelCostsItems,
            ]);

            // first array element is YTD
            const totalRevenuesYTD = actualBudgetItems.revenueGrossIncome[0];
            const ebitdaYTD = actualBudgetItems.operatingExpensesEBITDA[0];
            // skipping first 5 elements which are P&L items not month values
            const totalRevenuesLastMonth = actualBudgetItems.revenueGrossIncome[lastMonthIndex + 5] ?? 0;
            const ebitdaLastMonth = actualBudgetItems.operatingExpensesEBITDA[lastMonthIndex + 5] ?? 0;

            return {
                companyValue,
                totalRevenuesYTD,
                totalRevenuesLastMonth,
                ebitdaYTD,
                ebitdaLastMonth,
            };
        } catch (e) {
            console.log(`Can't get company's financial numbers: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.FINANCIAL_NUMBERS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getFinancialActualVsBudgetChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<FinancialActualVsBudgetDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const estimatedBudgetItems = await this.budgetItemService.getBudgetItems(userPayload);
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const monthsLabels = actualBudgetItems.revenueItems[0]?.months.map((monthDate) =>
                monthDate.date.substring(4, 7),
            );
            const chartData = await this.mapFinancialActualVsBudgetChartData(
                estimatedBudgetItems,
                actualBudgetItems,
                monthsLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }

    public async mapFinancialActualVsBudgetChartData(
        estimatedBudgetItems: BudgetItemsListDto,
        actualBudgetItems: ActualBudgetItemsListDto,
        monthsLabels: string[],
        language: string,
    ): Promise<FinancialActualVsBudgetDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            // array slices start after skipping the first 5 calculated values (if any) which are not month values
            // till it reaches the same length of the months labels array
            const actualSalesDataset: ChartDataSetsItem = {
                label: "Actual Sales",
                data: actualBudgetItems.revenueGrossIncome.slice(5, monthsLabels.length + 5),
            };
            const budgetSalesDataset: ChartDataSetsItem = {
                label: "Budget Sales",
                data: estimatedBudgetItems.revenueGrossIncome.slice(0, monthsLabels.length),
            };
            const actualEBITDADataset: ChartDataSetsItem = {
                label: "Actual EBITDA",
                data: actualBudgetItems.operatingExpensesEBITDA.slice(5, monthsLabels.length + 5),
            };
            const budgetEBITDADataset: ChartDataSetsItem = {
                label: "Budget EBITDA",
                data: estimatedBudgetItems.operatingExpensesEBITDA.slice(0, monthsLabels.length),
            };
            return {
                labels: monthsLabels,
                datasets: [actualSalesDataset, budgetSalesDataset, actualEBITDADataset, budgetEBITDADataset],
            };
        } catch (e) {
            console.log(`Can't get financial actual vs budget chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.FINANCIAL_ACTUAL_VS_BUDGET_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getFinancialPLBreakdownChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<FinancialPLBreakdownDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const monthsLabels = actualBudgetItems.revenueItems[0]?.months.map((monthDate) =>
                monthDate.date.substring(4, 7),
            );
            const chartData = await this.mapFinancialPLBreakdownChartData(
                actualBudgetItems,
                monthsLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }
    public async mapFinancialPLBreakdownChartData(
        actualBudgetItems: ActualBudgetItemsListDto,
        monthsLabels: string[],
        language: string,
    ): Promise<FinancialPLBreakdownDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const ebitdaDataset: ChartDataSetsItem = {
                label: "EBITDA",
                data: actualBudgetItems.operatingExpensesEBITDA.slice(5, monthsLabels.length + 5),
            };
            const operationalCostsDataset: ChartDataSetsItem = {
                label: "Operational Costs",
                data: actualBudgetItems.totalOperatingExpenses.slice(5, monthsLabels.length + 5),
            };
            const staffCostsDataset: ChartDataSetsItem = {
                label: "Staff Costs",
                data: actualBudgetItems.totalPersonnelCosts.slice(5, monthsLabels.length + 5),
            };
            const grossProfitDataset: ChartDataSetsItem = {
                label: "Gross Profit",
                data: actualBudgetItems.revenueGrossIncome.slice(5, monthsLabels.length + 5),
            };

            return {
                labels: monthsLabels,
                datasets: [ebitdaDataset, operationalCostsDataset, staffCostsDataset, grossProfitDataset],
            };
        } catch (e) {
            console.log(`Can't get financial P&L breakdown chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.FINANCIAL_PL_BREAKDOWN_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getFinancialSalesComponentsChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<FinancialSalesComponentsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const monthsLabels = actualBudgetItems.revenueItems[0]?.months.map((monthDate) =>
                monthDate.date.substring(4, 7),
            );
            const chartData = await this.mapFinancialSalesComponentsChartData(
                actualBudgetItems,
                monthsLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }

    public async mapFinancialSalesComponentsChartData(
        actualBudgetItems: ActualBudgetItemsListDto,
        monthsLabels: string[],
        language: string,
    ): Promise<FinancialSalesComponentsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const datasets: ChartDataSetsItem[] = actualBudgetItems.revenueItems.map((item) => ({
                label: item.name,
                data: item.months.map((month) => month.value),
            }));
            return {
                labels: monthsLabels,
                datasets,
            };
        } catch (e) {
            console.log(`Can't get financial sales components chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.FINANCIAL_SALES_COMPONENT_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getCompanyHRNumbers(userPayload: UserPayloadDto, language: string): Promise<DashboardHRNumbersDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const lastMonthIndex = this.getLastUpdatedMonthIndex(actualBudgetItems.personnelCostsItems);
            const hrNumbers = await this.mapCompanyHRNumbers(actualBudgetItems, lastMonthIndex, languageCode);
            return hrNumbers;
        } catch (e) {
            throw e;
        }
    }
    public async mapCompanyHRNumbers(
        actualBudgetItems: ActualBudgetItemsListDto,
        lastMonthIndex: number,
        language: string,
    ): Promise<DashboardHRNumbersDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            // first array element is YTD
            const totalSalariesYTD = actualBudgetItems.totalPersonnelCosts[0];
            // skipping first 5 elements which are P&L items not month values
            const totalSalariesLastMonth = actualBudgetItems.totalPersonnelCosts[lastMonthIndex + 5] ?? 0;
            return { totalSalariesYTD, totalSalariesLastMonth };
        } catch (e) {
            console.log(`Can't get company's HR numbers: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.HR_NUMBERS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getHRStaffCostsYTDChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<HRStaffCostsYTDDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const lastMonthIndex = this.getLastUpdatedMonthIndex(actualBudgetItems.personnelCostsItems);
            const staffLabels = actualBudgetItems.personnelCostsItems.map((item) => item.name);
            const chartData = await this.mapHRStaffCostsYTDChartData(
                actualBudgetItems,
                lastMonthIndex,
                staffLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }

    public async mapHRStaffCostsYTDChartData(
        actualBudgetItems: ActualBudgetItemsListDto,
        lastMonthIndex: number,
        staffLabels: string[],
        language: string,
    ): Promise<HRStaffCostsYTDDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const ytds: number[] = actualBudgetItems.personnelCostsItems.map((item) => {
                const totalYTD = item.months.reduce(
                    (acc, month, index) => (index <= lastMonthIndex ? acc + month.value : acc),
                    0,
                );
                return totalYTD;
            });
            let totalData = ytds.reduce((acc, value) => acc + value, 0);
            totalData = totalData ? totalData : 1;
            const percentagesData = ytds.map((value) => {
                const percentage = (value / totalData) * 100;
                return Number(percentage.toFixed(2));
            });
            return {
                labels: staffLabels,
                datasets: [{ label: "", data: percentagesData }],
            };
        } catch (e) {
            console.log(`Can't get HR staff costs YTD chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.HR_STAFF_COSTS_YTD_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getHRStaffCostsAvg4MonthsChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<HRStaffCostsAvg4MonthsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const lastMonthIndex = this.getLastUpdatedMonthIndex(actualBudgetItems.personnelCostsItems);
            const staffLabels = actualBudgetItems.personnelCostsItems.map((item) => item.name);
            const chartData = await this.mapHRStaffCostsAvg4MonthsChartData(
                actualBudgetItems,
                lastMonthIndex,
                staffLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }

    public async mapHRStaffCostsAvg4MonthsChartData(
        actualBudgetItems: ActualBudgetItemsListDto,
        lastMonthIndex: number,
        staffLabels: string[],
        language: string,
    ): Promise<HRStaffCostsAvg4MonthsDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const avgs: number[] = actualBudgetItems.personnelCostsItems.map((item) => {
                let noOfMonths = 0;
                const total = item.months.reduce((acc, month, index) => {
                    if (index > lastMonthIndex - 4 && index <= lastMonthIndex) {
                        noOfMonths++;
                        return acc + month.value;
                    }
                    return acc;
                }, 0);
                if (noOfMonths === 0) return total;
                return total / noOfMonths;
            });
            let totalData = avgs.reduce((acc, value) => acc + value, 0);
            totalData = totalData ? totalData : 1;
            const percentagesData = avgs.map((value) => {
                const percentage = (value / totalData) * 100;
                return Number(percentage.toFixed(2));
            });
            return {
                labels: staffLabels,
                datasets: [{ label: "", data: percentagesData }],
            };
        } catch (e) {
            console.log(`Can't get HR staff costs avg. 4 months chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.HR_STAFF_AVG_4_MONTHS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getHRActualVsBudgetChartData(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<HRActualVsBudgetDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const estimatedBudgetItems = await this.budgetItemService.getBudgetItems(userPayload);
            const actualBudgetItems = await this.profitLossService.getActualBudgetItemsTableData(
                userPayload,
                languageCode,
            );
            const lastMonthIndex = this.getLastUpdatedMonthIndex(actualBudgetItems.personnelCostsItems);
            const staffLabels = actualBudgetItems.personnelCostsItems.map((item) => item.name);
            const chartData = await this.mapHRActualVsBudgetChartData(
                estimatedBudgetItems,
                actualBudgetItems,
                lastMonthIndex,
                staffLabels,
                languageCode,
            );
            return chartData;
        } catch (e) {
            throw e;
        }
    }

    public async mapHRActualVsBudgetChartData(
        estimatedBudgetItems: BudgetItemsListDto,
        actualBudgetItems: ActualBudgetItemsListDto,
        lastMonthIndex: number,
        staffLabels: string[],
        language: string,
    ): Promise<HRActualVsBudgetDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const budgetSalaries = estimatedBudgetItems.personnelCostsItems.map(
                (item) => item.months[lastMonthIndex].value,
            );
            const budgetSalariesDataset: ChartDataSetsItem = {
                label: "Budget",
                data: budgetSalaries,
            };
            const actualBudgetSalaries = actualBudgetItems.personnelCostsItems.map(
                (item) => item.months[lastMonthIndex].value,
            );
            const actualBudgetSalariesDataset: ChartDataSetsItem = {
                label: "Actual",
                data: actualBudgetSalaries,
            };
            return {
                labels: staffLabels,
                datasets: [budgetSalariesDataset, actualBudgetSalariesDataset],
            };
        } catch (e) {
            console.log(`Can't get HR actual vs budget salaries chart data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(DashboardKeys.HR_ACTUAL_VS_BUDGET_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
