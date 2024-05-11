import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ExistingSharesDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    existingShares: number;

    @ApiProperty()
    @Expose()
    existingSharesLessESOP: number;
}
