import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BudgetItemRevenueFutureGrowthEntity } from "./budget-item-revenue-future-growth.entity";
import { RevenueItemEntity } from "src/modules/revenue-model/entities/revenue-item.entity";
import { BudgetItemEntity } from "./budget-item.entity";
import { BudgetMonthEntity } from "./budget-month.entity";

@Entity("budget_item_revenue")
export class BudgetItemRevenueEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_item_revenue_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "quantity",
        nullable: false,
        default: 0,
        type: "float",
    })
    quantity: number;

    @Expose()
    @Column({
        name: "price",
        nullable: false,
        default: 0,
        type: "float",
    })
    price: number;

    @Expose()
    @Column({
        name: "old_added_value",
        nullable: false,
        default: 0,
        type: "float",
    })
    oldAddedValue: number;

    @Expose()
    @Column({
        name: "existing_quantity_at_start_of_month",
        nullable: false,
        default: 0,
        type: "float",
    })
    existingQuantityAtStartOfMonth: number;

    @Expose()
    @Column({
        name: "new_monthly_quantities",
        nullable: false,
        default: 0,
        type: "float",
    })
    newMonthlyQuantities: number;

    @Expose()
    @Column({
        name: "quantity_leave_month_one",
        nullable: false,
        default: 0,
        type: "float",
    })
    quantityLeaveMonthOne: number;

    @Expose()
    @Column({
        name: "quantity_leave_month_two",
        nullable: false,
        default: 0,
        type: "float",
    })
    quantityLeaveMonthTwo: number;

    @Expose()
    @Column({
        name: "quantity_leave_month_three",
        nullable: false,
        default: 0,
        type: "float",
    })
    quantityLeaveMonthThree: number;

    @Expose()
    @Column({
        name: "residual_churned_quantities",
        nullable: false,
        default: 0,
        type: "float",
    })
    residualChurnedQuantities: number;

    @Column({
        name: "parent_budget_item_revenue_id",
        nullable: true
    })
    public parentBudgetItemRevenueId?: number;

    @ManyToOne(() => BudgetItemRevenueEntity, (budgetItemRevenue) => budgetItemRevenue.id, {
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "parent_budget_item_revenue_id" })
    public parentBudgetItemRevenue?: BudgetItemRevenueEntity;

    @ManyToOne(() => BudgetItemRevenueFutureGrowthEntity, (budgetItemRevenueFutureGrowth) => budgetItemRevenueFutureGrowth.budgetItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_item_revenue_future_growth_id" })
    public budgetItemRevenueFutureGrowth: BudgetItemRevenueFutureGrowthEntity;

    @ManyToOne(() => RevenueItemEntity, (revenueItem) => revenueItem.budgetItemRevenues, {
        cascade: true,
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "revenue_item_id" })
    public revenueItem: RevenueItemEntity;

    @ManyToOne(() => BudgetItemEntity, (budgetItem) => budgetItem.budgetItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_item_id" })
    public budgetItem: BudgetItemEntity;

    @ManyToOne(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "budget_month_id" })
    public budgetMonth: BudgetMonthEntity;
}
