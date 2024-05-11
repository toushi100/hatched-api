import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from "class-validator";

export class UpdateUserProfileDto extends AbstractDto {
    @ApiPropertyOptional({ minLength: 1, maxLength: 50 })
    @IsString()
    @Expose()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Invalid email format",
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @Expose()
    @IsOptional()
    email?: string;

    @IsString()
    @Expose()
    @ApiProperty()
    @ApiPropertyOptional({ minLength: 1, maxLength: 50 })
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    @IsOptional()
    lastName?: string;

    @Expose()
    @ApiProperty({
        additionalProperties: {
            required: ["newPassword"],
        },
    })
    @ApiPropertyOptional()
    @ValidateIf((object) => object.newPassword)
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({
        additionalProperties: {
            required: ["newPassword"],
        },
    })
    @ApiPropertyOptional()
    @Expose()
    @ValidateIf((object) => object.oldPassword)
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password too weak",
    })
    newPassword: string;
}
