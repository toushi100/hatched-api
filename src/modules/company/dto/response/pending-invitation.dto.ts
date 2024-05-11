import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { IsNumber, Matches } from "class-validator";

export class PendingInvitationDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    invitationId: number;

    @ApiProperty({ type: "email", default: "invitation@email.com" })
    @Expose()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    email: string;
}
