import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../../common/dto/abstract-dto";

export class TokenPayloadDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    expiresIn: string;

    @ApiProperty()
    @Expose()
    accessToken: string;

    @ApiProperty()
    @Expose()
    refreshToken: string;
}
