import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BudgetItemEntity } from "./budget-item.entity";
import { BudgetMonthEntity } from "./budget-month.entity";

@Entity("budget_item_direct_cost")
export class BudgetItemDirectCostEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_item_direct_cost_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "percentage",
        nullable: false,
        default: 0,
        type: "float",
    })
    percentage: number;

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

    @ManyToOne(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetItemDirectCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_month_id" })
    public budgetMonth: BudgetMonthEntity;

    @ManyToOne(() => BudgetItemEntity, (budgetItem) => budgetItem.budgetItemDirectCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_item_id" })
    public budgetItem: BudgetItemEntity;

    @ManyToOne(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetItemDirectCostDependencies, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "percentage_from_budget_month_id" })
    public percentageFromBudgetMonth: BudgetMonthEntity;
}
