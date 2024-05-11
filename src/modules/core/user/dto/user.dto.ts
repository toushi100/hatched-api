import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { AccountType } from "../account-type.enum";

export class UserDto extends AbstractDto {
    @IsString()
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    firstName: string;


    @IsString()
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    lastName: string;

    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @ApiProperty()
    @Expose()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password too weak",
    })
    @ApiProperty()
    @Expose()
    password: string;

    @ApiPropertyOptional({ maxLength: 100, default: "company" })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    companyName?: string;

    @ApiPropertyOptional({ maxLength: 100, default: "accelerator" })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    acceleratorName?: string;

    @IsEnum(AccountType)
    @ApiProperty()
    @IsNotEmpty()
    accountType: AccountType;
}
