import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ValuationDto extends AbstractDto {
    @ApiProperty({ type: () => [Number] })
    @Expose()
    columnCount: number;

    @ApiProperty({ type: () => [Number] })
    @Expose()
    yearsHeader: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    growth: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    growthMargin: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    monthlyChurn: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    multiple: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    mrr: number[];

    @ApiProperty({ type: () => [Number] })
    @Expose()
    valueOfBusiness: number[];
}
