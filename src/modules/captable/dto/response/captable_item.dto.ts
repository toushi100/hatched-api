import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class CaptableItemDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    shares: number;

    @ApiProperty()
    @Expose()
    percentage: number;

    @ApiProperty()
    @Expose()
    votingPercentage: number;

    @ApiProperty()
    @Expose()
    incorporation: number;

    @ApiProperty()
    @Expose()
    round1: number;

    @ApiProperty()
    @Expose()
    round2: number;

    @ApiProperty()
    @Expose()
    round3: number;

    @ApiProperty()
    @Expose()
    round4: number;

    @ApiProperty()
    @Expose()
    esop: number;
}
