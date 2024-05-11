import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class EmailVerificationCodeDto extends AbstractDto {
    @IsString()
    @IsNotEmpty()
    @Length(5, 5)
    @ApiProperty()
    @Expose()
    code: string;
}
