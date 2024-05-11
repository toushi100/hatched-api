import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
    ArrayMaxSize,
    ArrayMinSize,
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export enum YearName {
    YEAR1 = "year1",
    YEAR2 = "year2",
    YEAR3 = "year3",
    YEAR4 = "year4",
    YEAR5 = "year5",
}

export class YearSharesDto {
    @ApiProperty({ description: "Year name", enum: YearName })
    @IsEnum(YearName)
    yearName: YearName;

    @ApiProperty({ description: "esop percentage", minimum: 0, maximum: 100 })
    @IsNumber()
    @Max(100, { message: "Percentage must be less than or equal 100" })
    @Min(0, { message: "Percentage cannot be negative" })
    sharesPercentage: number;
}

export class CreateESOPDto extends AbstractDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @IsString()
    @IsNotEmpty()
    @Expose()
    @MinLength(1, { message: "Plan name must be between 1 and 200 characters long." })
    @MaxLength(200, { message: "Plan name must be between 1 and 200 characters long." })
    name: string;

    @ApiProperty({ description: "Number of years.", minimum: 0, maximum: 5 })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    @Min(0, { message: "Years cannot be negative" })
    @Max(5, { message: "Max number of years is 5" })
    numberOfYears: number;

    @ApiProperty({ description: "ESOP years names and shares percentages", type: () => [YearSharesDto] })
    @IsArray()
    @Type(() => YearSharesDto)
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @ValidateNested()
    yearsDistribution: YearSharesDto[];
}
