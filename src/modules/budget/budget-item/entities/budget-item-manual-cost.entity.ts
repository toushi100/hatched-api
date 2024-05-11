import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BudgetMonthEntity } from "./budget-month.entity";
import { BudgetItemEntity } from "./budget-item.entity";

@Entity("budget_item_manual_cost")
export class BudgetItemManualCostEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_item_manual_cost_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "monthly_growth",
        nullable: false,
        default: 0,
        type: "float",
    })
    monthlyGrowth: number;

    @Expose()
    @Column({
        name: "amount",
        nullable: false,
        default: 0,
        type: "float",
    })
    amount: number;

    @Expose()
    @Column({
        name: "old_added_value",
        nullable: false,
        default: 0,
        type: "float",
    })
    oldAddedValue: number;

    @Column({
        name: "parent_budget_item_manual_cost_id",
        nullable: true
    })
    public parentBudgetItemManualCostId?: number;

    @ManyToOne(() => BudgetItemManualCostEntity, (budgetItemDirectCost) => budgetItemDirectCost.id, {
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "parent_budget_item_manual_cost_id" })
    public parentBudgetItemManualCost?: BudgetItemManualCostEntity;

    @ManyToOne(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetItemManualCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_month_id" })
    public budgetMonth: BudgetMonthEntity;

    @ManyToOne(() => BudgetItemEntity, (budgetItem) => budgetItem.budgetItemManualCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_item_id" })
    public budgetItem: BudgetItemEntity;
}
