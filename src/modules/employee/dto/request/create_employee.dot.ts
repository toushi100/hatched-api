import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    Min,
    Matches,
} from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { IsFounder, IsOrganizationHead } from "../../types/founder.type";

export class CreateEmployeeDto extends AbstractDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    fullName: string;

    @ApiProperty({ type: () => Date })
    @Expose()
    @IsDateString()
    @IsNotEmpty()
    birthDate: Date;

    @ApiProperty({ minLength: 1, maxLength: 50 })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    phone: string;

    @ApiProperty()
    @Expose()
    @IsString()
    @IsNotEmpty()
    taxNo: string;

    @ApiProperty()
    @Expose()
    @IsString()
    @IsNotEmpty()
    socialSecurity: string;

    @ApiProperty()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @Expose()
    email: string;

    @ApiProperty({ minimum: 1 })
    @Expose()
    @IsNumber()
    @Min(1, { message: "Invalid department ID" })
    departmentId: number;

    @ApiPropertyOptional({ minimum: 1 })
    @Expose()
    @IsOptional()
    @IsNumber()
    @Min(1, { message: "Invalid reporting to employee ID" })
    reportingToId?: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    yearlySalary: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    childrenBelow18: number;

    @ApiProperty({ type: () => Date })
    @Expose()
    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @ApiPropertyOptional({ type: () => Date })
    @Expose()
    @IsOptional()
    @IsDateString()
    @IsNotEmpty()
    endDate?: Date;

    @ApiProperty({ enum: IsFounder })
    @Expose()
    @IsEnum(IsFounder)
    isFounder: IsFounder;

    @ApiPropertyOptional({ minimum: 1 })
    @Expose()
    @IsNumber()
    @IsOptional()
    esopPlanId?: number;

    @ApiPropertyOptional()
    @Expose()
    @IsNumber()
    @IsOptional()
    sharesAllocated?: number;

    @ApiProperty({ maxLength: 200 })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({ enum: IsOrganizationHead })
    @Expose()
    @IsEnum(IsOrganizationHead)
    isOrganizationHead: IsOrganizationHead;
}
