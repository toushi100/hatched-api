import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { IsEmail } from "class-validator";

export class SendInvitationsDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value.map((email) => email.toString().toLowerCase()))
    @IsEmail({}, { each: true })
    invitedInvestorsEmails: string[];
}
