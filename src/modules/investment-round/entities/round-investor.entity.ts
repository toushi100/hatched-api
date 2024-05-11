import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { RoundInvestorInvestmentEntity } from "./round-investor-investment.entity";

@Entity("round_investor")
@Unique(["email", "company"])
export class RoundInvestorEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "round_investor_id" })
    @Expose()
    id: number;

    @Column({
        type: "varchar",
        nullable: false,
    })
    @Expose()
    name: string;

    @Column({
        name: "email",
        type: "varchar",
        nullable: false,
    })
    @Expose()
    email: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    @Expose()
    phone: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    @Expose()
    nationality: string;

    @Column({
        name: "tax_no",
        type: "varchar",
        nullable: true,
    })
    @Expose()
    taxNo: string;

    @ManyToOne(() => CompanyEntity, (company) => company.investmentRounds, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => RoundInvestorInvestmentEntity, (investment) => investment.investor)
    public investments: RoundInvestorInvestmentEntity[];
}
