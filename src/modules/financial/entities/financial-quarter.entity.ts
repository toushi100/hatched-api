import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { FinancialItemEntity } from "./financial-item.entity";
import { FinancialItemRevenueEntity } from "./financial-item-revenue.entity";
import { FinancialItemDirectCostEntity } from "./financial-item-direct-cost.entity";
import { FinancialItemManualCostEntity } from "./financial-item-manual-cost.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialQuarterRatioEntity } from "./financial-quarter-ratio.entity";

@Entity("financial_quarter")
export class FinancialQuarterEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_quarter_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "quarter_date",
        nullable: false,
    })
    quarterDate: Date;

    @Expose()
    @Column({
        name: "quarter_number",
        nullable: false,
    })
    quarterNumber: number;

    @Expose()
    @Column({
        name: "value",
        nullable: false,
        default: 0,
        type: "float",
    })
    value: number;

    @Expose()
    @Column({ name: "display_order", nullable: true })
    displayOrder: number;

    @Expose()
    @Column({
        name: "category_type",
        type: "enum",
        enum: BudgetCategory,
        nullable: false,
    })
    categoryType: BudgetCategory;

    @Expose()
    @Column({
        name: "old_value",
        nullable: false,
        default: 0,
        type: "float",
    })
    oldValue: number;

    @ManyToOne(() => FinancialItemEntity, (financialItem) => financialItem.financialQuarters, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_item_id" })
    public financialItem: FinancialItemEntity;

    @OneToMany(() => FinancialItemRevenueEntity, (financialItemRevenue) => financialItemRevenue.financialQuarter)
    public financialItemRevenues: FinancialItemRevenueEntity[];

    @OneToMany(
        () => FinancialItemDirectCostEntity,
        (financialItemDirectCost) => financialItemDirectCost.financialQuarter,
    )
    public financialItemDirectCosts: FinancialItemDirectCostEntity[];

    @OneToMany(
        () => FinancialItemDirectCostEntity,
        (financialItemDirectCost) => financialItemDirectCost.percentageFromFinancialQuarter,
    )
    public financialItemDirectCostDependencies: FinancialItemDirectCostEntity[];


    @OneToMany(
        () => FinancialItemManualCostEntity,
        (financialItemManualCost) => financialItemManualCost.financialQuarter,
    )
    public financialItemManualCosts: FinancialItemManualCostEntity[];

    @ManyToOne(() => FinancialQuarterRatioEntity, (financialQuarterRatio) => financialQuarterRatio.financialQuarters, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_quarter_ratio_id" })
    public financialQuarterRatio: FinancialQuarterRatioEntity;
}
