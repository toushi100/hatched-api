import { IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { StaticTextCategoryParamDto } from "./static-text-category-param.dto";

export class StaticTextCategoryAndTextKeyParamDto extends StaticTextCategoryParamDto {
  @IsString()
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  textKey: string;
}
