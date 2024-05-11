import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { BudgetCategoryEntity } from "../../budget/budget-category/entities/budget-category.entity";
import { FinancialQuarterEntity } from "./financial-quarter.entity";
import { FinancialItemRevenueEntity } from "./financial-item-revenue.entity";
import { FinancialItemDirectCostEntity } from "./financial-item-direct-cost.entity";
import { FinancialItemManualCostEntity } from "./financial-item-manual-cost.entity";
import { ItemEntity } from "src/modules/company/entities/item.entity";

@Entity("financial_item")
export class FinancialItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_item_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({ name: "display_order", nullable: true })
    displayOrder: number;

    @ManyToOne(() => CompanyEntity, (company) => company.financialItems, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @ManyToOne(() => BudgetCategoryEntity, (category) => category.financialItems, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "category_id" })
    public budgetCategory: BudgetCategoryEntity;

    @OneToMany(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialItem)
    public financialQuarters: FinancialQuarterEntity[];

    @OneToMany(() => FinancialItemRevenueEntity, (financialItemRevenue) => financialItemRevenue.financialItem)
    public financialItemRevenues: FinancialItemRevenueEntity[];

    @OneToMany(() => FinancialItemDirectCostEntity, (financialItemDirectCost) => financialItemDirectCost.financialItem)
    public financialItemDirectCosts: FinancialItemDirectCostEntity[];

    @OneToMany(() => FinancialItemManualCostEntity, (financialItemManualCost) => financialItemManualCost.financialItem)
    public financialItemManualCosts: FinancialItemManualCostEntity[];

    @OneToOne(() => ItemEntity, (item) => item.financialItem, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "item_id" })
    @Expose()
    item: ItemEntity;
}
