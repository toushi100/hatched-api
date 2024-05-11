import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { FinancialQuarterEntity } from "./financial-quarter.entity";

@Entity("financial_quarter_ratio")
export class FinancialQuarterRatioEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "financial_quarter_ratio_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "quarter_date",
        nullable: false
    })
    quarterDate: Date;

    @Expose()
    @Column({
        name: "quarter_number",
        nullable: false
    })
    quarterNumber: number;

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

    @ManyToOne(() => CompanyEntity, (company) => company.financialQuarterRatios, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => FinancialQuarterEntity, (financialQuarter) => financialQuarter.financialQuarterRatio)
    public financialQuarters: FinancialQuarterEntity[];
}
