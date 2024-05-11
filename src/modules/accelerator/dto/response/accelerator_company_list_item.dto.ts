import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";
import {IsString, IsNumber, IsUrl} from "class-validator";
import {AbstractDto} from "../../../../common/dto/abstract-dto";

export class AcceleratorCompanyListItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    companyId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty({description: "Link of the company logo"})
    @Expose()
    @IsString()
    @IsUrl()
    logo: string;
}


