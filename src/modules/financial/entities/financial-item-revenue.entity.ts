import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { FinancialItemEntity } from "./financial-item.entity";
import { RevenueItemEntity } from "src/modules/revenue-model/entities/revenue-item.entity";
import { FinancialQuarterEntity } from "./financial-quarter.entity";
import { FinancialItemRevenueFutureGrowthEntity } from "./financial-item-revenue-future-growth.entity";

@Entity("financial_item_revenue")
export class FinancialItemRevenueEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_item_revenue_id",
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
        name: "existing_quantity_at_start_of_quarter",
        nullable: false,
        default: 0,
        type: "float",
    })
    existingQuantityAtStartOfQuarter: number;

    @Expose()
    @Column({
        name: "new_quarterly_quantities",
        nullable: false,
        default: 0,
        type: "float",
    })
    newQuarterlyQuantities: number;

    @Expose()
    @Column({
        name: "quantity_leave_quarter_one",
        nullable: false,
        default: 0,
        type: "float",
    })
    quantityLeaveQuarterOne: number;

    @Expose()
    @Column({
        name: "residual_churned_quantities",
        nullable: false,
        default: 0,
        type: "float",
    })
    residualChurnedQuantities: number;

    @Column({
        name: "parent_financial_item_revenue_id",
        nullable: true
    })
    public parentFinancialItemRevenueId?: number;

    @ManyToOne(() => FinancialItemRevenueEntity, (financialItemRevenue) => financialItemRevenue.id, {
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "parent_financial_item_revenue_id" })
    public parentFinancialItemRevenue?: FinancialItemRevenueEntity;

    @ManyToOne(() => FinancialItemRevenueFutureGrowthEntity, (financialItemRevenueFutureGrowth) => financialItemRevenueFutureGrowth.financialItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_item_revenue_future_growth_id" })
    public financialItemRevenueFutureGrowth: FinancialItemRevenueFutureGrowthEntity;

    @ManyToOne(() => RevenueItemEntity, (revenueItem) => revenueItem.financialItemRevenues, {
        cascade: true,
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "revenue_item_id" })
    public revenueItem: RevenueItemEntity;

    @ManyToOne(() => FinancialItemEntity, (financialItem) => financialItem.financialItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_item_id" })
    public financialItem: FinancialItemEntity;

    @ManyToOne(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialItemRevenues, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_quarter_id" })
    public financialQuarter: FinancialQuarterEntity;
}
