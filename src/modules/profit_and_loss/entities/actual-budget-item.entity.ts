import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { BudgetCategoryEntity } from "../../budget/budget-category/entities/budget-category.entity";
import { ItemEntity } from "src/modules/company/entities/item.entity";
import { ActualBudgetMonthEntity } from "./actual-budget-month.entity";

@Entity("actual_budget_item")
export class ActualBudgetItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "actual_budget_item_id",
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

    @OneToMany(() => ActualBudgetMonthEntity, (actualBudgetMonth) => actualBudgetMonth.actualBudgetItem)
    public actualBudgetMonths: ActualBudgetMonthEntity[];

    @OneToOne(() => ItemEntity, (item) => item.financialItem, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "item_id" })
    @Expose()
    item: ItemEntity;
}
