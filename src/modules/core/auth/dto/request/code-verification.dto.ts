import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";

export class CodeVerificationDto extends AbstractDto {
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => value ? value.toString().toLowerCase() : value)
    @ApiProperty()
    @Expose()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 5)
    @ApiProperty()
    @Expose()
    code: string;
}
