import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

export class BasicOperationsResponse {
    @ApiProperty()
    @IsBoolean()
    @Expose()
    isSuccessful?: boolean;

    @ApiProperty()
    @IsString()
    @Expose()
    message?: string;
}
