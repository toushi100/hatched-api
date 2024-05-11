import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class CreateAcceleratorDto extends AbstractDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @IsString()
    @Expose()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    name: string;
}
