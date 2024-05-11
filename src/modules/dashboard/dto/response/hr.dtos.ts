import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";
import { AbstractChartDataDto } from "./abstract-chart-data.dto";

export class DashboardHRNumbersDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    totalSalariesYTD: number;

    @ApiProperty()
    @Expose()
    totalSalariesLastMonth: number;
}

export class HRStaffCostsYTDDto extends AbstractChartDataDto {}

export class HRStaffCostsAvg4MonthsDto extends AbstractChartDataDto {}

export class HRActualVsBudgetDto extends AbstractChartDataDto {}

export class HRNumbersAndChartsDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    numbers: DashboardHRNumbersDto;

    @ApiProperty()
    @Expose()
    staffCostsYTDChart: HRStaffCostsYTDDto;

    @ApiProperty()
    @Expose()
    staffCostsAvg4MonthsChart: HRStaffCostsAvg4MonthsDto;

    @ApiProperty()
    @Expose()
    actualVsBudgetChart: HRActualVsBudgetDto;
}
