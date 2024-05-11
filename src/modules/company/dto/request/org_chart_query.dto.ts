import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class GetOrgChartQueryDto extends AbstractDto {
    @ApiPropertyOptional({ required: false })
    @Expose()
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => (isNaN(Number(value)) ? undefined : Number(value)))
    headEmployeeId?: number;
}
