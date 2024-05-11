import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";

export class BudgetItemMonth extends AbstractDto {
    @ApiProperty()
    @Expose()
    budgetItemMonthId: number;

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

export class BudgetItemsListItem extends AbstractDto {
    @ApiProperty()
    @Expose()
    budgetItemId: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({ type: () => [BudgetItemMonth] })
    @Expose()
    months: BudgetItemMonth[];

    @ApiProperty()
    @Expose()
    total: number;
}

export class BudgetItemsListDto extends AbstractDto {
    @ApiProperty({ type: () => [BudgetItemsListItem] })
    @Expose()
    revenueItems: BudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    revenueGrossIncome: number[];

    @ApiProperty({ type: () => [BudgetItemsListItem] })
    @Expose()
    directCostsItems: BudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalDirectCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMargin: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    directCostsGrossMarginPercentage: number[];

    @ApiProperty({ type: () => [BudgetItemsListItem] })
    @Expose()
    personnelCostsItems: BudgetItemsListItem[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    totalPersonnelCosts: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    staffCostsPercentageRevenue: number[];

    @ApiProperty({ type: () => [BudgetItemsListItem] })
    @Expose()
    operatingExpensesItems: BudgetItemsListItem[];

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
