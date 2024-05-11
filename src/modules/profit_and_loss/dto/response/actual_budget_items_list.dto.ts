import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ActualBudgetItemMonth extends AbstractDto {
    @ApiProperty()
    @Expose()
    actualBudgetItemMonthId: number;

    @ApiProperty()
    @Expose()
    date: string;

    @ApiProperty()
    @Expose()
    value: number;

    @ApiProperty()
    @Expose()
    monthNumber: number;
}

export class ProfitAndLossItem extends AbstractDto {
    @ApiProperty({ type: () => String })
    @Expose()
    name: string;

    @ApiProperty({ type: () => Number })
    @Expose()
    value: number;
}

export class ActualBudgetItemsListItem extends AbstractDto {
    @ApiProperty()
    @Expose()
    actualBudgetItemId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({ type: () => [ActualBudgetItemMonth] })
    @Expose()
    months: ActualBudgetItemMonth[];

    @ApiProperty({ type: () => [ProfitAndLossItem] })
    @Expose()
    profitAndLossItems: ProfitAndLossItem[];
}

export class ActualBudgetItemsListDto extends AbstractDto {
    @ApiProperty({ type: () => [ActualBudgetItemsListItem] })
    @Expose()
    revenueItems: ActualBudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    revenueGrossIncome: number[];

    @ApiProperty({ type: () => [ActualBudgetItemsListItem] })
    @Expose()
    directCostsItems: ActualBudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalDirectCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMargin: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMarginPercentage: number[];

    @ApiProperty({ type: () => [ActualBudgetItemsListItem] })
    @Expose()
    personnelCostsItems: ActualBudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalPersonnelCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    staffCostsPercentageRevenue: number[];

    @ApiProperty({ type: () => [ActualBudgetItemsListItem] })
    @Expose()
    operatingExpensesItems: ActualBudgetItemsListItem[];

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
