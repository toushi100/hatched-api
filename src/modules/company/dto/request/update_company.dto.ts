import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsOptional, IsUrl, MinLength, MaxLength, IsNumber, IsEmpty } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateCompanyDto extends AbstractDto {
    @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
    @Expose()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(200)
    jobTitle?: string;

    @ApiPropertyOptional({ description: "Link of the company logo" })
    @Expose()
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    website?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    iosURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    playStoreURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    fbURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    igURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    linkedinURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    twitterURL?: string;


    @ApiPropertyOptional()
    @Expose()
    @IsNumber()
    @IsOptional()
    acceleratorId?: number;

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isAccelerator: boolean;

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isInvestor: boolean;
}
