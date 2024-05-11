import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "./company.entity";
import { FinancialItemEntity } from "src/modules/financial/entities/financial-item.entity";
import { BudgetItemEntity } from "src/modules/budget/budget-item/entities/budget-item.entity";
import { ActualBudgetItemEntity } from "src/modules/profit_and_loss/entities/actual-budget-item.entity";

@Entity("item")
export class ItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "item_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({ nullable: false })
    name: string;

    @Expose()
    @Column({ nullable: true, default: "" })
    description: string;

    @Expose()
    @Column({ name: "display_order", nullable: true })
    displayOrder: number;

    @ManyToOne(() => CompanyEntity, (company) => company.financialItems, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToOne(() => FinancialItemEntity, (financialItem) => financialItem.item)
    public financialItem: FinancialItemEntity;

    @OneToOne(() => BudgetItemEntity, (budgetItem) => budgetItem.item)
    public budgetItem: BudgetItemEntity;

    @OneToOne(() => ActualBudgetItemEntity, (actualBudgetItem) => actualBudgetItem.item)
    public actualBudgetItem: ActualBudgetItemEntity;
}
