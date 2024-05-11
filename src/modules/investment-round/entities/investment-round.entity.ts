import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { RoundInvestorInvestmentEntity } from "./round-investor-investment.entity";
// import { InvestmentRoundName } from "../types/InvestmentRoundName.enum";

@Entity("investment_round")
export class InvestmentRoundEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "investment_round_id" })
    @Expose()
    id: number;

    @Column({
        name: "name",
        type: "varchar",
        nullable: false,
    })
    @Expose()
    name: string;

    @Column({
        name: "value_per_last_company_valuation",
        type: "boolean",
        default: false,
    })
    @Expose()
    valuePerLastCompanyValuation: boolean;

    @Column({
        name: "pre_money",
        type: "float",
    })
    @Expose()
    preMoney: number;

    @Column({
        name: "investment_amount",
        type: "float",
    })
    @Expose()
    investmentAmount: number;

    @Column({
        name: "post_money",
        type: "float",
    })
    @Expose()
    postMoney: number;

    @Column({
        name: "existing_shares",
        type: "float",
    })
    @Expose()
    existingShares: number;

    @Column({
        name: "existing_shares_less_esop",
        type: "float",
    })
    @Expose()
    existingSharesLessESOP: number;

    @Column({
        name: "new_shares",
        type: "float",
    })
    @Expose()
    newShares: number;

    @Column({
        name: "total_shares_after_round",
        type: "float",
    })
    @Expose()
    totalSharesAfterRound: number;

    @Column({
        type: "timestamp without time zone",
        name: "round_closing_date",
        nullable: true,
    })
    @Expose()
    roundClosingDate: Date;

    @Column({
        type: "timestamp without time zone",
        name: "registration_date",
        nullable: true,
    })
    @Expose()
    registrationDate: Date;

    @ManyToOne(() => CompanyEntity, (company) => company.investmentRounds, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => RoundInvestorInvestmentEntity, (round) => round.investmentRound)
    public investorInvestments: RoundInvestorInvestmentEntity[];
}
