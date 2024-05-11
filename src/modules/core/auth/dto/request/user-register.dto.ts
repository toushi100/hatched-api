import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsEnum, ValidateIf } from "class-validator";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { AccountType } from "../../../user/account-type.enum";

export class UserRegisterDto extends AbstractDto {
    @IsString()
    @ApiProperty({ minLength: 1, maxLength: 50 })
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @ApiProperty({ minLength: 1, maxLength: 50 })
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    lastName: string;

    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @ApiProperty({ type: "email", default: "you@hatched.com" })
    @Expose()
    email: string;

    @ApiProperty({ default: "P@ssw0rd", minLength: 8, maxLength: 30 })
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password too weak",
    })
    @Expose()
    password: string;

    @IsEnum(AccountType)
    @ApiProperty({ enum: AccountType, default: AccountType.STARTUP })
    @IsNotEmpty()
    accountType: AccountType;

    @ApiProperty({ minLength: 1, maxLength: 200, description: "Required for Startup accounts only" })
    @IsString()
    @ValidateIf((dto: UserRegisterDto) => dto.accountType === AccountType.STARTUP)
    @MaxLength(200)
    companyName: string;

    @ApiProperty({ minLength: 1, maxLength: 200, description: "Required for Accelerator accounts only" })
    @IsString()
    @ValidateIf((dto: UserRegisterDto) => dto.accountType === AccountType.ACCELERATOR)
    @MaxLength(200)
    acceleratorName: string;
}
