import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { ValuationType } from "../../types/valuation_type.enum";

export class GetValuationDto extends AbstractDto {
    @ApiProperty({ enum: ValuationType, description: "The type of the valuation." })
    @Expose()
    @IsEnum(ValuationType)
    @IsNotEmpty()
    valuationType: ValuationType;
}
