import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { Domains } from '../et-file-manager.types';

export class CreateUploadUrRequestDto {
    @ApiProperty({ enum: Domains })
    @IsEnum(Domains)
    @Expose()
    domain: Domains;
}
