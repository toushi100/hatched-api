import { Expose } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { FinancialItemRevenueEntity } from "./financial-item-revenue.entity";

@Entity("financial_item_revenue_future_growth")
export class FinancialItemRevenueFutureGrowthEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_item_revenue_future_growth_id",
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
        name: "quarter1_churn",
        nullable: false,
        default: 0,
        type: "float",
    })
    quarter1Churn: number;

    @Expose()
    @Column({
        name: "residual_churn",
        nullable: false,
        default: 0,
        type: "float",
    })
    residualChurn: number;

    @OneToMany(() => FinancialItemRevenueEntity, (financialItemRevenue) => financialItemRevenue.financialItemRevenueFutureGrowth)
    public financialItemRevenues: FinancialItemRevenueEntity[];

    // TODO: add financial item revenue relation.
}
