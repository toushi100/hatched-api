import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";

export class UserLoginDto extends AbstractDto {
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @Expose()
    @ApiProperty({ type: "email", default: "you@hatched.com" })
    email: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    @ApiProperty({ default: "P@ssw0rd", minLength: 8, maxLength: 30 })
    password: string;
}
