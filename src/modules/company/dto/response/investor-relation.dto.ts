import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";

export class InvestorRelationDto extends AbstractDto {
    @ApiProperty({ type: "email", default: "investor@email.com" })
    @Expose()
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    email: string;

    @ApiProperty({ default: "date" })
    @Expose()
    date: string;
}
