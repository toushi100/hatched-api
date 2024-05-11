import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { Matches } from "class-validator";

export class UserEmailDto extends AbstractDto {
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => value ? value.toString().toLowerCase() : value)
    @ApiProperty()
    @Expose()
    email: string;
}
