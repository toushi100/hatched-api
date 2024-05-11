import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "./company.entity";

@Entity("company_plan_date")
export class CompanyPlanDateEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "company_plan_date_id" })
    id?: number;

    @Column({
        type: "timestamp",
        name: "budget_start_date",
        nullable: false,
    })
    budgetStartDate: Date;

    @Column({
        type: "timestamp",
        name: "budget_end_date",
        nullable: false,
    })
    budgetEndDate: Date;

    @Column({
        type: "timestamp",
        name: "financial_start_date",
        nullable: false,
    })
    financialStartDate: Date;

    @Column({
        type: "timestamp",
        name: "financial_end_date",
        nullable: false,
    })
    financialEndDate: Date;

    @OneToOne(() => CompanyEntity, (company) => company.planDate, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    @Expose()
    company: CompanyEntity;
}
