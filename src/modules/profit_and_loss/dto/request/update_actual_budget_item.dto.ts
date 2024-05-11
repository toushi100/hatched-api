import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, Min } from "class-validator";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class UpdateActualBudgetItemDto extends AbstractDto {
    @ApiProperty({ type: () => Date })
    @Expose()
    @IsDateString()
    @IsNotEmpty()
    actualBudgetItemMonthDate: Date;

    @ApiProperty({
        type: 'object',
        additionalProperties: {
            type: 'number',
        },
        example: {
            1: 100,
            2: 200,
            3: 50,
        },
        description: 'Dynamic key-value pairs where the key is the `actual budget item id` and the value is the actual value.',
    })
    @Expose()
    @IsObject()
    @IsNotEmptyObject()
    data: Record<number, number>;
}
