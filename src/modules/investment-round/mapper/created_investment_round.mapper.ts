import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedInvestmentRoundDto } from "../dto/response/created_investment_round.dto";
import { InvestmentRoundEntity } from "../entities/investment-round.entity";
import { GetInvestorWithRoundInvestmentDto } from "../dto/response/get_investor_round_investment.dto";
import { InvestmentRoundName } from "../types/InvestmentRoundName.enum";

@Injectable()
export class CreatedInvestmentRoundMapper extends AbstractMapper<CreatedInvestmentRoundDto, InvestmentRoundEntity> {
    fromEntityToDTO(
        destination: ClassType<CreatedInvestmentRoundDto>,
        sourceObject: InvestmentRoundEntity,
    ): CreatedInvestmentRoundDto {
        if (!sourceObject) {
            return null;
        }

        const investors = sourceObject.investorInvestments.map(
            (investment) =>
                ({
                    investorId: investment.investor.id,
                    investmentRoundId: sourceObject.id,
                    investorName: investment.investor.name,
                    email: investment.investor.email,
                    phone: investment.investor.phone,
                    nationality: investment.investor.nationality,
                    taxNo: investment.investor.taxNo,
                    investedAmount: investment.investedAmount,
                    shares: investment.shares,
                    sharesPercentage: Number(investment.percentage.toFixed(2)),
                    nominalPrice: investment.nominalPrice,
                    premium: investment.premium,
                    notes: investment.notes,
                    issuedSharesTo: investment.issuedSharesTo,
                    issuedSharesFrom: investment.issuedSharesFrom,
                } as GetInvestorWithRoundInvestmentDto),
        );

        return {
            roundId: sourceObject.id,
            name: sourceObject.name as InvestmentRoundName,
            valuePerLastCompanyValuation: sourceObject.valuePerLastCompanyValuation,
            preMoney: sourceObject.preMoney,
            investmentAmount: sourceObject.investmentAmount,
            postMoney: sourceObject.postMoney,
            existingShares: sourceObject.existingShares,
            existingSharesLessESOP: sourceObject.existingSharesLessESOP,
            newShares: sourceObject.newShares,
            totalSharesAfterRound: sourceObject.totalSharesAfterRound,
            roundClosingDate: sourceObject.roundClosingDate?.toISOString(),
            registrationDate: sourceObject.registrationDate?.toISOString(),
            status: sourceObject.roundClosingDate ? "Closed" : "Current",
            investors,
        };
    }
}
