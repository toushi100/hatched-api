import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class FinancialItemQuarter extends AbstractDto {
    @ApiProperty({ type: () => Number })
    @Expose()
    financialQuarterId: number;

    @ApiProperty({ type: () => String })
    @Expose()
    date: string;

    @ApiProperty({ type: () => Number })
    @Expose()
    value: number;

    @ApiProperty({ type: () => Number })
    @Expose()
    quarterNumber: number;
}

export class FinancialItemYear extends AbstractDto {
    @ApiProperty({ type: () => Number })
    @Expose()
    year: number;

    @ApiProperty({ type: () => Number })
    @Expose()
    value: number;
}

export class FinancialItemsListItem extends AbstractDto {
    @ApiProperty({ type: () => Number })
    @Expose()
    financialItemId: number;

    @ApiProperty({ type: () => String })
    @Expose()
    name: string;

    @ApiProperty({ type: () => [FinancialItemQuarter] })
    @Expose()
    quarters: FinancialItemQuarter[];

    @ApiProperty({ type: () => [FinancialItemYear] })
    @Expose()
    years: FinancialItemYear[];
}

export class FinancialItemsListDto extends AbstractDto {
    @ApiProperty({ type: () => [FinancialItemsListItem] })
    @Expose()
    revenueItems: FinancialItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    revenueGrossIncome: number[];

    @ApiProperty({ type: () => [FinancialItemsListItem] })
    @Expose()
    directCostsItems: FinancialItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalDirectCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMargin: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMarginPercentage: number[];

    @ApiProperty({ type: () => [FinancialItemsListItem] })
    @Expose()
    personnelCostsItems: FinancialItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalPersonnelCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    staffCostsPercentageRevenue: number[];

    @ApiProperty({ type: () => [FinancialItemsListItem] })
    @Expose()
    operatingExpensesItems: FinancialItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalOperatingExpenses: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    operatingExpensesPercentage: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    operatingExpensesEBITDA: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    operatingExpensesEBITDAPercentage: number[];
}
