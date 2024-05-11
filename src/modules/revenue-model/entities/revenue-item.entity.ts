import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { RevenueModelEntity } from "./revenue-model.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { FinancialItemRevenueEntity } from "src/modules/financial/entities/financial-item-revenue.entity";
import { BudgetItemRevenueEntity } from "src/modules/budget/budget-item/entities/budget-item-revenue.entity";

@Entity("revenue_item")
export class RevenueItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "revenue_item_id",
    })
    @Expose()
    public id?: number;

    @Column()
    @Expose()
    public name: string;

    @Column({
        nullable: true,
        default: "",
    })
    @Expose()
    public description: string;

    @Column({ name: "initial_price", type: "float" })
    @Expose()
    public initialPrice: number;

    @ManyToOne(() => RevenueModelEntity, (revenueModel) => revenueModel.revenueItems, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "revenue_model_id" })
    public revenueModel: RevenueModelEntity;

    @ManyToOne(() => CompanyEntity, (company) => company.revenueItems, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => FinancialItemRevenueEntity, (financialItemRevenue) => financialItemRevenue.revenueItem)
    public financialItemRevenues: FinancialItemRevenueEntity[];

    @OneToMany(() => BudgetItemRevenueEntity, (budgetItemRevenue) => budgetItemRevenue.revenueItem)
    public budgetItemRevenues: BudgetItemRevenueEntity[];
}
