import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { EmailResetPasswordVerificationCodeDto } from "./email-reset-password-verification-code.dto";

export class ResetPasswordDto extends EmailResetPasswordVerificationCodeDto {
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password too weak",
    })
    @ApiProperty()
    @Expose()
    password: string;
}
