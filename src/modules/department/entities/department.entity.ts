import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { EmployeeEntity } from "../../employee/entities/employee.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { FinancialItemEntity } from "../../financial/entities/financial-item.entity";
import { BudgetItemEntity } from "../../budget/budget-item/entities/budget-item.entity";

@Entity("department")
export class DepartmentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "department_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "name",
        type: "varchar",
        nullable: false,
    })
    name: string;

    @Expose()
    @Column({
        name: "financial_item_id",
        type: "int",
        nullable: true,
    })
    financialItemId: number;

    @Expose()
    @Column({
        name: "budget_item_id",
        type: "int",
        nullable: true,
    })
    budgetItemId: number;

    @Expose()
    @Column({
        name: "description",
        type: "varchar",
        nullable: true,
        default: "",
    })
    description: string;

    @OneToMany(() => EmployeeEntity, (employee) => employee.department)
    public employees: EmployeeEntity[];

    @ManyToOne(() => CompanyEntity, (company) => company.departments, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToOne(() => FinancialItemEntity)
    @JoinColumn({ name: "financial_item_id" })
    financialItem: FinancialItemEntity;

    @OneToOne(() => BudgetItemEntity)
    @JoinColumn({ name: "budget_item_id" })
    budgetItem: BudgetItemEntity;
}
