import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";
import {IsString, IsNumber, IsUrl, IsDate} from "class-validator";
import {AbstractDto} from "../../../../common/dto/abstract-dto";

export class AcceleratorListItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    acceleratorId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    title: string;

    @ApiProperty()
    @Expose()
    @IsDate()
    createdAt: Date;
}


