import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { RoundInvestorEntity } from "./round-investor.entity";
import { InvestmentRoundEntity } from "./investment-round.entity";

@Entity("round_investor_investment")
export class RoundInvestorInvestmentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "investment_id" })
    @Expose()
    id: number;

    @ManyToOne(() => RoundInvestorEntity, (investor) => investor.investments, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "investor_id" })
    @Expose()
    investor: RoundInvestorEntity;

    @ManyToOne(() => InvestmentRoundEntity, (investmentRound) => investmentRound.investorInvestments, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "investment_round_id" })
    @Expose()
    investmentRound: InvestmentRoundEntity;

    @Column({
        name: "invested_amount",
        type: "float",
    })
    @Expose()
    investedAmount: number;

    @Column({
        name: "issued_shares_from",
        nullable: true,
        type: "int",
    })
    @Expose()
    issuedSharesFrom: number;

    @Column({
        name: "issued_shares_to",
        nullable: true,
        type: "int",
    })
    @Expose()
    issuedSharesTo: number;

    @Column({
        name: "shares",
        type: "float",
        nullable: true,
    })
    @Expose()
    shares: number;

    @Column({
        name: "percentage",
        type: "float",
    })
    @Expose()
    percentage: number;

    @Column({
        name: "nominal_price",
        type: "float",
    })
    @Expose()
    nominalPrice: number;

    @Column({
        name: "premium",
        type: "float",
    })
    @Expose()
    premium: number;

    @Column({
        name: "notes",
        type: "text",
        nullable: true,
    })
    @Expose()
    notes: string;
}
