import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsOptional, IsUrl } from "class-validator";
import { MinimalCompanyDto } from "./minimal_company.dto";

export class CreatedCompanyDto extends MinimalCompanyDto {
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

    // @ApiProperty()
    // @Expose()
    // @IsNumber()
    // @IsOptional()
    // acceleratorId?: number;

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

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isAccelerator: boolean;

    // @ApiProperty()
    // @Expose()
    // @IsBoolean()
    // isInvestor: boolean;
}
