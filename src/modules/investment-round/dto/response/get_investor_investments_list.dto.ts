import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class RoundInvestmentDto extends AbstractDto {
    @ApiProperty({ minimum: 100 })
    @Expose()
    investmentRoundId: number;

    @ApiProperty({ minimum: 100 })
    @Expose()
    investedAmount: number;

    @ApiProperty()
    @Expose()
    shares: number;

    @ApiProperty()
    @Expose()
    sharesPercentage: number;

    @ApiProperty()
    @Expose()
    nominalPrice: number;

    @ApiProperty()
    @Expose()
    premium: number;

    @ApiProperty({ maxLength: 1000 })
    @Expose()
    notes: string;
}

export class GetInvestorInvestmentsListDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    investorId: number;

    @ApiProperty()
    @Expose()
    investmentRoundId: number;

    @ApiProperty({ minLength: 2, maxLength: 50 })
    @Expose()
    investorName: string;

    @ApiProperty({ default: "investor@hatched.com" })
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    phone: string;

    @ApiProperty()
    @Expose()
    nationality: string;

    @ApiProperty()
    @Expose()
    taxNo: string;

    @ApiProperty({ type: () => [RoundInvestmentDto] })
    @Expose()
    roundInvestments: RoundInvestmentDto[];
}
