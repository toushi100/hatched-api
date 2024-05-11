import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BudgetItemEntity } from "./budget-item.entity";
import { BudgetCategory } from "../../budget-category/types/budget_category.enum";
import { BudgetItemRevenueEntity } from "./budget-item-revenue.entity";
import { BudgetItemDirectCostEntity } from "./budget-item-direct-cost.entity";
import { BudgetItemManualCostEntity } from "./budget-item-manual-cost.entity";
import { BudgetMonthRatioEntity } from "./budget-month-ratio.entity";

@Entity("budget_month")
export class BudgetMonthEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_month_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "month_date",
        nullable: false
    })
    monthDate: Date;

    @Expose()
    @Column({
        name: "month_number",
        nullable: false
    })
    monthNumber: number;

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

    @ManyToOne(() => BudgetItemEntity, (budgetItem) => budgetItem.budgetMonths, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_item_id" })
    public budgetItem: BudgetItemEntity;

    @OneToMany(() => BudgetItemRevenueEntity, (budgetItemRevenue) => budgetItemRevenue.budgetMonth)
    public budgetItemRevenues: BudgetItemRevenueEntity[];

    @OneToMany(() => BudgetItemDirectCostEntity, (budgetItemDirectCost) => budgetItemDirectCost.budgetMonth)
    public budgetItemDirectCosts: BudgetItemDirectCostEntity[];

    @OneToMany(() => BudgetItemDirectCostEntity, (budgetItemDirectCost) => budgetItemDirectCost.percentageFromBudgetMonth)
    public budgetItemDirectCostDependencies: BudgetItemDirectCostEntity[];

    @OneToMany(() => BudgetItemManualCostEntity, (budgetItemManualCost) => budgetItemManualCost.budgetMonth)
    public budgetItemManualCosts: BudgetItemManualCostEntity[];

    @ManyToOne(() => BudgetMonthRatioEntity, (budgetMonthRatio) => budgetMonthRatio.budgetMonths, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_month_ratio_id" })
    public budgetMonthRatio: BudgetMonthRatioEntity;
}
