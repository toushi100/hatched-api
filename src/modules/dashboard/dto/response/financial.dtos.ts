import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";
import { AbstractChartDataDto } from "./abstract-chart-data.dto";

export class DashboardFinancialNumbersDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    companyValue: number;

    @ApiProperty()
    @Expose()
    totalRevenuesYTD: number;

    @ApiProperty()
    @Expose()
    totalRevenuesLastMonth: number;

    @ApiProperty()
    @Expose()
    ebitdaYTD: number;

    @ApiProperty()
    @Expose()
    ebitdaLastMonth: number;
}

export class FinancialActualVsBudgetDto extends AbstractChartDataDto {}

export class FinancialPLBreakdownDto extends AbstractChartDataDto {}

export class FinancialSalesComponentsDto extends AbstractChartDataDto {}

export class FinancialNumbersAndChartsDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    numbers: DashboardFinancialNumbersDto;

    @ApiProperty()
    @Expose()
    actualVsBudgetChart: FinancialActualVsBudgetDto;

    @ApiProperty()
    @Expose()
    plBreakdownChart: FinancialPLBreakdownDto;

    @ApiProperty()
    @Expose()
    salesComponentsChart: FinancialSalesComponentsDto;
}
