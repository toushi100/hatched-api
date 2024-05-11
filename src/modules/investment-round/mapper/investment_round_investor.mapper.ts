import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { GetInvestorWithRoundInvestmentDto } from "../dto/response/get_investor_round_investment.dto";
import { RoundInvestorEntity } from "../entities/round-investor.entity";
import { GetInvestorInvestmentsListDto, RoundInvestmentDto } from "../dto/response/get_investor_investments_list.dto";

@Injectable()
export class InvestorRoundInvestmentMapper extends AbstractMapper<
    GetInvestorWithRoundInvestmentDto | GetInvestorInvestmentsListDto,
    RoundInvestorEntity
> {
    fromEntityToInvestorWithRoundInvestmentDTO(
        destination: ClassType<GetInvestorWithRoundInvestmentDto>,
        sourceObject: RoundInvestorEntity,
    ): GetInvestorWithRoundInvestmentDto {
        if (!sourceObject) {
            return null;
        }

        return {
            investorId: sourceObject.id,
            investmentRoundId: sourceObject.investments[0].id,
            investorName: sourceObject.name,
            email: sourceObject.email,
            phone: sourceObject.phone,
            nationality: sourceObject.nationality,
            taxNo: sourceObject.taxNo,
            investedAmount: sourceObject.investments[0].investedAmount,
            shares: sourceObject.investments[0].shares,
            premium: sourceObject.investments[0].premium,
            nominalPrice: sourceObject.investments[0].nominalPrice,
            sharesPercentage: sourceObject.investments[0].percentage,
            notes: sourceObject.investments[0].notes,
            issuedSharesFrom: sourceObject.investments[0].issuedSharesFrom,
            issuedSharesTo: sourceObject.investments[0].issuedSharesTo,
        };
    }

    fromEntityToInvestorWithInvestmentsListDTO(
        destination: ClassType<GetInvestorInvestmentsListDto>,
        sourceObject: RoundInvestorEntity,
    ): GetInvestorInvestmentsListDto {
        if (!sourceObject) {
            return null;
        }

        const mappedRoundInvestments = sourceObject.investments.map(
            (inv) =>
            ({
                investedAmount: inv.investedAmount,
                shares: inv.shares,
                premium: inv.premium,
                nominalPrice: inv.nominalPrice,
                sharesPercentage: inv.percentage,
                notes: inv.notes,
            } as RoundInvestmentDto),
        );

        return {
            investorId: sourceObject.id,
            investmentRoundId: sourceObject.investments[0].id,
            investorName: sourceObject.name,
            email: sourceObject.email,
            phone: sourceObject.phone,
            nationality: sourceObject.nationality,
            taxNo: sourceObject.taxNo,
            roundInvestments: mappedRoundInvestments,
        };
    }
}
