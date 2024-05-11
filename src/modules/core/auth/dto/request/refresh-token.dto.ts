import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";

export class RefreshTokenDto extends AbstractDto {
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Expose()
    readonly userId: number;

    @ApiProperty()
    @IsString()
    @Expose()
    readonly refreshToken: string;
}
