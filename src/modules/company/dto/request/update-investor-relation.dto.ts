import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { Matches } from "class-validator";

export class UpdateInvestorRelationDto extends AbstractDto {
    @ApiProperty({ type: "email", default: "old_investor@email.com" })
    @Expose()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    oldEmail: string;

    @ApiProperty({ type: "email", default: "new_investor@email.com" })
    @Expose()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    newEmail: string;
}
