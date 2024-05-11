import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class RoundInvestorInvestmentDto extends AbstractDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @ApiProperty({ type: "email", default: "investor@hatched.com" })
    @Expose()
    @IsEmail()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Invalid email format",
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    email: string;

    @ApiPropertyOptional()
    @Expose()
    @IsOptional()
    @IsString()
    phone: string;

    @ApiProperty()
    @Expose()
    @IsString()
    @IsNotEmpty()
    nationality: string;

    @ApiProperty()
    @Expose()
    @IsString()
    @IsNotEmpty()
    taxNo: string;

    @ApiProperty({ minimum: 1 })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    investedAmount: number;

    @ApiPropertyOptional()
    @Expose()
    @IsNumber()
    @IsOptional()
    issuedSharesFrom?: number;

    @ApiPropertyOptional()
    @Expose()
    @IsNumber()
    @IsOptional()
    issuedSharesTo?: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    sharesPercentage: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    shares: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    nominalPrice: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    premium: number;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    notes: string;
}
