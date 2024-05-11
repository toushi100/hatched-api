import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "src/common/dto/abstract-dto";

export class ChartDataSetsItem extends AbstractDto {
    @ApiProperty()
    @Expose()
    label: string;

    @ApiProperty()
    @Expose()
    data: number[];
}

export class AbstractChartDataDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    labels: string[];

    @ApiProperty({ type: () => [ChartDataSetsItem] })
    @Expose()
    datasets: ChartDataSetsItem[];
}
