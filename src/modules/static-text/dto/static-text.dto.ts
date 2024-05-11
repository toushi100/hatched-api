import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AbstractDto } from "../../../common/dto/abstract-dto";

export class StaticTextDto extends AbstractDto {
    @IsString()
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    textKey: string;

    @IsString()
    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    value: string;

    @IsString()
    @ApiProperty()
    @Expose()
    keyDescription: string;
}
