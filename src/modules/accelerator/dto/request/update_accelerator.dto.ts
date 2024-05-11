import { CreateAcceleratorDto } from "./create_accelerator.dto";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateAcceleratorDto extends PartialType(CreateAcceleratorDto) {

    @ApiPropertyOptional({ maxLength: 200 })
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(200)
    title?: string;
}
