import { ApiPropertyOptional } from "@nestjs/swagger";
import { isNumber, IsNumber, IsOptional } from "class-validator";

import { Transform, Type } from "class-transformer";
import { AbstractDto } from "./abstract-dto";

export class PaginationDto extends AbstractDto {
    @ApiPropertyOptional({ default: 1 })
    @Transform(({ value }) => value ? value : 1)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page: number;

    @ApiPropertyOptional({ default: 10 })
    @Transform(({ value }) => value ? value : 10)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    take: number;

    get skip() {
        return (this.page - 1) * this.take;
    }

    applyPagination(): Boolean {
        return isNumber(this.page) && isNumber(this.take);
    }
}
