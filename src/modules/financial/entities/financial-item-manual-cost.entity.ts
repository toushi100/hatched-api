import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { FinancialItemEntity } from "./financial-item.entity";
import { FinancialQuarterEntity } from "./financial-quarter.entity";

@Entity("financial_item_manual_cost")
export class FinancialItemManualCostEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_item_manual_cost_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "quarterly_growth",
        nullable: false,
        default: 0,
        type: "float",
    })
    quarterlyGrowth: number;

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
        name: "parent_financial_item_manual_cost_id",
        nullable: true
    })
    public parentFinancialItemManualCostId?: number;

    @ManyToOne(() => FinancialItemManualCostEntity, (financialItemDirectCost) => financialItemDirectCost.id, {
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "parent_financial_item_manual_cost_id" })
    public parentFinancialItemManualCost?: FinancialItemManualCostEntity;

    @ManyToOne(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialItemManualCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_quarter_id" })
    public financialQuarter: FinancialQuarterEntity;

    @ManyToOne(() => FinancialItemEntity, (financialItem) => financialItem.financialItemManualCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_item_id" })
    public financialItem: FinancialItemEntity;
}
