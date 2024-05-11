import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";
import {IsString, IsNumber} from "class-validator";
import {AbstractDto} from "src/common/dto/abstract-dto";

export class CreatedAcceleratorDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    acceleratorId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;
}

export class AcceleratorItemDto extends AbstractDto {

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    title: string;
}
