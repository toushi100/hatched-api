import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";
import { CompanyEntity } from "../../../company/entities/company.entity";
import { BudgetCategoryEntity } from "../../budget-category/entities/budget-category.entity";
import { BudgetMonthEntity } from "./budget-month.entity";
import { BudgetItemRevenueEntity } from "./budget-item-revenue.entity";
import { BudgetItemDirectCostEntity } from "./budget-item-direct-cost.entity";
import { BudgetItemManualCostEntity } from "./budget-item-manual-cost.entity";
import { ItemEntity } from "src/modules/company/entities/item.entity";

@Entity("budget_item")
export class BudgetItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_item_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({ name: "display_order", nullable: true })
    displayOrder: number;

    @ManyToOne(() => CompanyEntity, (company) => company.budgetItems, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @ManyToOne(() => BudgetCategoryEntity, (category) => category.budgetItems, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "category_id" })
    public budgetCategory: BudgetCategoryEntity;

    @OneToMany(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetItem)
    public budgetMonths: BudgetMonthEntity[];

    @OneToMany(() => BudgetItemRevenueEntity, (budgetItemRevenue) => budgetItemRevenue.budgetItem)
    public budgetItemRevenues: BudgetItemRevenueEntity[];

    @OneToMany(() => BudgetItemDirectCostEntity, (budgetItemDirectCost) => budgetItemDirectCost.budgetItem)
    public budgetItemDirectCosts: BudgetItemDirectCostEntity[];

    @OneToMany(() => BudgetItemManualCostEntity, (budgetItemManualCost) => budgetItemManualCost.budgetItem)
    public budgetItemManualCosts: BudgetItemManualCostEntity[];

    @OneToOne(() => ItemEntity, (item) => item.budgetItem, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "item_id" })
    @Expose()
    item: ItemEntity;
}
