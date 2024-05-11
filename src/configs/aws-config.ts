import { IsNotEmpty, IsString } from "class-validator";

export class AwsConfig {
    @IsString()
    @IsNotEmpty()
    AWS_ACCESS_KEY_ID: string;

    @IsString()
    @IsNotEmpty()
    AWS_SECRET_ACCESS_KEY: string;

    @IsString()
    @IsNotEmpty()
    AWS_REGION: string;

    @IsString()
    @IsNotEmpty()
    AWS_S3_BUCKET_NAME: string;
}
