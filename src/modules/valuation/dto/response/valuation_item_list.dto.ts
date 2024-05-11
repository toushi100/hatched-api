import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class ValuationItemListDto extends AbstractDto {
    @ApiProperty()
    name: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: {
            type: 'string',
        },
        example: {
            2023: 'Value for 2023',
            2024: 'Value for 2024',
            2025: 'Value for 2025',
            // Add more years as needed...
        },
        description: 'Dynamic key-value pairs where the key is the year and the value is a string.',
    })
    data: Record<number, string>;
}
