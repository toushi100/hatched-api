import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    ValidateIf,
    ValidateNested,
} from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { RoundInvestorInvestmentDto } from "./round_investor_investment.dto";
import { InvestmentRoundName } from "../../types/InvestmentRoundName.enum";

export class CreateInvestmentRoundDto extends AbstractDto {
    @ApiProperty({ enum: InvestmentRoundName, default: InvestmentRoundName.Incorporation })
    @Expose()
    @IsEnum(InvestmentRoundName)
    @IsNotEmpty()
    name: InvestmentRoundName;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    valuePerLastCompanyValuation: boolean;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    preMoney: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    postMoney: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    existingShares: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    existingSharesLessESOP: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    newRoundShares: number;

    @ApiProperty({ minimum: 1 })
    @Expose()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    investmentAmount: number;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    exportToNewCapTable: boolean;

    @ApiProperty({ default: "2023-10-01" })
    @Expose()
    @IsDateString()
    @ValidateIf((dto: CreateInvestmentRoundDto) => dto.exportToNewCapTable)
    @IsNotEmpty()
    roundClosingDate: string;

    @ApiProperty({ default: "2023-10-01" })
    @Expose()
    @IsDateString()
    @ValidateIf((dto: CreateInvestmentRoundDto) => dto.exportToNewCapTable)
    @IsNotEmpty()
    registrationDate: string;

    @ApiPropertyOptional({ type: () => [RoundInvestorInvestmentDto], description: "List of this round's investors" })
    @IsOptional()
    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoundInvestorInvestmentDto)
    investors: RoundInvestorInvestmentDto[];
}
