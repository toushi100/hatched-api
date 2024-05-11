import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNumber } from "class-validator";
import { BasicOperationsResponse } from "../../../../../common/dto/basic-operations-response.dto";
import { TokenPayloadDto } from "./token-payload.dto";
import { AccountType } from "src/modules/core/user/account-type.enum";

export class UserLoginResponseDto extends BasicOperationsResponse {
    @ApiProperty({ type: TokenPayloadDto })
    @Expose()
    token: TokenPayloadDto;

    @ApiProperty({ default: 1 })
    @IsNumber()
    @Expose()
    userId: number;

    @ApiProperty({ enum: AccountType, default: AccountType.STARTUP })
    @IsEnum(AccountType)
    @Expose()
    accountType: AccountType;
}
