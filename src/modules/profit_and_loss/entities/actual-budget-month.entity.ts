import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActualBudgetItemEntity } from "./actual-budget-item.entity";
import { ActualBudgetMonthRatioEntity } from "./actual-budget-month-ratio.entity";

@Entity("actual_budget_month")
export class ActualBudgetMonthEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "actual_budget_month_id",
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

    @ManyToOne(() => ActualBudgetItemEntity, (actualBudgetItem) => actualBudgetItem.actualBudgetMonths, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "actual_budget_item_id" })
    public actualBudgetItem: ActualBudgetItemEntity;

    @ManyToOne(() => ActualBudgetMonthRatioEntity, (actualBudgetMonthRatio) => actualBudgetMonthRatio.actualBudgetMonths, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "actual_budget_month_ratio_id" })
    public actualBudgetMonthRatio: ActualBudgetMonthRatioEntity;
}
