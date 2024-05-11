import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";
import { GetInvestorWithRoundInvestmentDto } from "./get_investor_round_investment.dto";
import { InvestmentRoundName } from "../../types/InvestmentRoundName.enum";

export class CreatedInvestmentRoundDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    roundId: number;

    @ApiProperty()
    @Expose()
    name: InvestmentRoundName;

    @ApiProperty()
    @Expose()
    valuePerLastCompanyValuation: boolean;

    @ApiProperty()
    @Expose()
    preMoney: number;

    @ApiProperty()
    @Expose()
    investmentAmount: number;

    @ApiProperty()
    @Expose()
    postMoney: number;

    @ApiProperty()
    @Expose()
    existingShares: number;

    @ApiProperty()
    @Expose()
    existingSharesLessESOP: number;

    @ApiProperty()
    @Expose()
    newShares: number;

    @ApiProperty()
    @Expose()
    totalSharesAfterRound: number;

    @ApiPropertyOptional()
    @Expose()
    roundClosingDate?: string;

    @ApiPropertyOptional()
    @Expose()
    registrationDate?: string;

    @ApiProperty()
    @Expose()
    status: "Current" | "Closed";

    @ApiProperty({ type: () => [GetInvestorWithRoundInvestmentDto], description: "List of this round investors" })
    @Expose()
    investors: GetInvestorWithRoundInvestmentDto[];
}
