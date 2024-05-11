import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsNumber } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class EmployeeNodeDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number;

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
    @IsString()
    department: string;

    @ApiProperty()
    @Expose()
    @IsString()
    parentId: string;
}
