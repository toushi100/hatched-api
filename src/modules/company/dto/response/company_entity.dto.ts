import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsOptional, IsUrl, IsNumber } from "class-validator";
import { MinimalCompanyDto } from "./minimal_company.dto";

export class CompanyEntityDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    @IsOptional()
    companyId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsNumber()
    @IsOptional()
    acceleratorId?: number;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    iosURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    playStoreURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    fbURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    igURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    linkedinURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    twitterURL?: string;

    @ApiPropertyOptional()
    @Expose()
    @IsString()
    @IsUrl()
    @IsOptional()
    jobTitle?: string;

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isAccelerator: boolean;

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isInvestor: boolean;
}
