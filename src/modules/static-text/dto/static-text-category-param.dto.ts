import { AbstractDto } from "../../../common/dto/abstract-dto";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { StaticTextCategoryEnum } from "../static-text-category.enum";

export class StaticTextCategoryParamDto extends AbstractDto {
  @IsEnum(StaticTextCategoryEnum)
  @Expose()
  @ApiProperty()
  staticTextCategory: StaticTextCategoryEnum;
}
