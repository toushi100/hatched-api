import { Expose } from "class-transformer";
import { AbstractEntity } from "src/common/abstract.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BudgetMonthEntity } from "./budget-month.entity";

@Entity("budget_month_ratio")
export class BudgetMonthRatioEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "budget_month_ratio_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "month_date",
        nullable: false
    })
    monthDate: Date;

    @Expose()
    @Column({
        name: "month_number",
        nullable: false
    })
    monthNumber: number;

    @Expose()
    @Column({
        name: "gross_income",
        nullable: false,
        default: 0,
        type: "float",
    })
    grossIncome: number;

    @Expose()
    @Column({
        name: "total_direct_costs",
        nullable: false,
        default: 0,
        type: "float",
    })
    totalDirectCosts: number;

    @Expose()
    @Column({
        name: "gross_margin",
        nullable: false,
        default: 0,
        type: "float",
    })
    grossMargin: number;

    @Expose()
    @Column({
        name: "gross_margin_percentage",
        nullable: false,
        default: 0,
        type: "float",
    })
    grossMarginPercentage: number;

    @Expose()
    @Column({
        name: "total_personnel_costs",
        nullable: false,
        default: 0,
        type: "float",
    })
    totalPersonnelCosts: number;

    @Expose()
    @Column({
        name: "total_operating_expenses",
        nullable: false,
        default: 0,
        type: "float",
    })
    totalOperatingExpenses: number;

    @Expose()
    @Column({
        name: "ebitda",
        nullable: false,
        default: 0,
        type: "float",
    })
    ebitda: number;

    @Expose()
    @Column({
        name: "ebitda_percentage",
        nullable: false,
        default: 0,
        type: "float",
    })
    ebitdaPercentage: number;

    @ManyToOne(() => CompanyEntity, (company) => company.budgetMonthRatios, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => BudgetMonthEntity, (budgetMonth) => budgetMonth.budgetMonthRatio)
    public budgetMonths: BudgetMonthEntity[];
}
