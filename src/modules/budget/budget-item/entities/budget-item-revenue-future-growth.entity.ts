import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BudgetItemRevenueEntity } from "./budget-item-revenue.entity";

@Entity("budget_item_revenue_future_growth")
export class BudgetItemRevenueFutureGrowthEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_item_revenue_future_growth_id",
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
        name: "month1_churn",
        nullable: false,
        default: 0,
        type: "float",
    })
    month1Churn: number;

    @Expose()
    @Column({
        name: "month2_churn",
        nullable: false,
        default: 0,
        type: "float",
    })
    month2Churn: number;

    @Expose()
    @Column({
        name: "month3_churn",
        nullable: false,
        default: 0,
        type: "float",
    })
    month3Churn: number;

    @Expose()
    @Column({
        name: "months4_to_12_churn_rate",
        nullable: false,
        default: 0,
        type: "float",
    })
    months4To12ChurnRate: number;

    @OneToMany(() => BudgetItemRevenueEntity, (budgetItemRevenue) => budgetItemRevenue.budgetItemRevenueFutureGrowth)
    public budgetItemRevenues: BudgetItemRevenueEntity[];

    // TODO: add budget item revenue relation.
}
