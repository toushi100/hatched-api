import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { AbstractDto } from "../../../common/dto/abstract-dto";

export class StaticTextUpdateDto extends AbstractDto {
    @IsString()
    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    value: string;
}
