import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreatedInvestmentRoundDto } from "./created_investment_round.dto";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class InvestmentRoundsListDto extends AbstractDto {
    @ApiProperty({ type: () => [CreatedInvestmentRoundDto] })
    @Expose()
    investmentRounds: CreatedInvestmentRoundDto[];

    @ApiProperty()
    @Expose()
    totalCount: number;
}
