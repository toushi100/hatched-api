import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUploadUrlResponseDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    uploadUrl: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fileUrl: string;
}
