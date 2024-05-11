import { AbstractDto } from "../../../../common/dto/abstract-dto";
import { IsString, Matches } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { UserRole } from "../user-role.enum";
import { AccountType } from "../account-type.enum";

export class UserPayloadDto extends AbstractDto {
    @IsString()
    @Expose()
    id: number;

    @IsString()
    @Expose()
    firstName: string;

    @IsString()
    @Expose()
    lastName: string;

    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Invalid email format',
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @Expose()
    email: string;

    @Expose()
    roles: UserRole[];

    @Expose()
    accountType: AccountType;
}
