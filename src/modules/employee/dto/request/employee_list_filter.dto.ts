import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../../../common/dto/pagination.dto";

export class EmployeeListFilterDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;
}
