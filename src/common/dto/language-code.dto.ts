import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { AbstractDto } from "./abstract-dto";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";

export class LanguageCodeDto extends AbstractDto {
    @ApiProperty({ enum: AvailableLanguageCodes })
    @Expose()
    @IsEnum(AvailableLanguageCodes)
    languageCode: AvailableLanguageCodes;
}
