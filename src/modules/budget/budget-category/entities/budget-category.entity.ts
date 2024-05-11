import { Expose } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";
import { BudgetItemEntity } from "../../budget-item/entities/budget-item.entity";
import { BudgetCategory } from "../types/budget_category.enum";
import { FinancialItemEntity } from "../../../financial/entities/financial-item.entity";

@Entity("budget_category")
export class BudgetCategoryEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_category_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({ nullable: false })
    name: string;

    @Expose()
    @Column({ type: "enum", enum: BudgetCategory })
    type: BudgetCategory;

    @Expose()
    @Column({ nullable: true, default: "", })
    description: string;

    @Expose()
    @Column({ name: "display_order", nullable: true })
    displayOrder: number;

    @OneToMany(() => BudgetItemEntity, (budgetItem) => budgetItem.budgetCategory)
    public budgetItems: BudgetItemEntity[];

    @OneToMany(() => FinancialItemEntity, (financialItem) => financialItem.budgetCategory)
    public financialItems: FinancialItemEntity[];
}
