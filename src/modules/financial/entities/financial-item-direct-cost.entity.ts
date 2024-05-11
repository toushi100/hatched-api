import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { FinancialItemEntity } from "./financial-item.entity";
import { FinancialQuarterEntity } from "./financial-quarter.entity";

@Entity("financial_item_direct_cost")
export class FinancialItemDirectCostEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_item_direct_cost_id",
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

    @ManyToOne(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialItemDirectCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_quarter_id" })
    public financialQuarter: FinancialQuarterEntity;

    @ManyToOne(() => FinancialItemEntity, (financialItem) => financialItem.financialItemDirectCosts, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "financial_item_id" })
    public financialItem: FinancialItemEntity;

    @ManyToOne(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialItemDirectCostDependencies, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "percentage_from_financial_quarter_id" })
    public percentageFromFinancialQuarter: FinancialQuarterEntity;
}
