import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches } from "class-validator";
import { Transform, Type } from "class-transformer";

export class EnvConfig {
    // environment
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    NODE_ENV = "development";

    @Type(() => Number)
    @IsNumber()
    PORT: number;

    // database
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    DATABASE_TYPE = "postgres";

    @IsString()
    @IsNotEmpty()
    DATABASE_USER: string;

    @IsString()
    @IsNotEmpty()
    DATABASE_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    DATABASE_NAME: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    DATABASE_PORT = 5432;

    @IsString()
    @IsNotEmpty()
    DATABASE_HOST: string;

    // typeOrm
    @IsOptional()
    @Transform(({ value }) => {
        return [true, "enabled", "true"].indexOf(value) > -1;
    })
    @IsBoolean()
    TYPEORM_SYNCHRONIZE = false;

    @IsOptional()
    @Transform(({ value }) => {
        return [true, "enabled", "true"].indexOf(value) > -1;
    })
    @IsBoolean()
    TYPEORM_MIGRATIONS = false;

    // translate
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    FALLBACK_LANGUAGE = "en";

    // jwt
    @IsString()
    @IsNotEmpty()
    JWT_ACCESS_TOKEN_SECRET_KEY: string;

    @IsString()
    @IsNotEmpty()
    JWT_ACCESS_TOKEN_EXPIRES_IN: string;

    @IsString()
    @IsNotEmpty()
    JWT_REFRESH_TOKEN_EXPIRES_IN: string;

    @IsString()
    @IsNotEmpty()
    JWT_REFRESH_TOKEN_SECRET_KEY: string;

    // smtp
    @IsString()
    @IsNotEmpty()
    SMTP_SERVER_HOST: string;

    @Type(() => Number)
    @IsNumber()
    SMTP_SERVER_PORT: number;

    @IsString()
    @IsNotEmpty()
    SMTP_SERVER_USER_NAME: string;

    @IsString()
    @IsNotEmpty()
    SMTP_SERVER_PASSWORD: string;

    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Invalid email format",
    })
    @Transform(({ value }) => (value ? value.toString().toLowerCase() : value))
    @IsNotEmpty()
    SMTP_SERVER_SENDER_EMAIL: string;

    // code expiration time
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    EMAIL_VERIFICATION_CODE_EXPIRATION_IN_MINUTE = 5;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    REST_PASSWORD_CODE_EXPIRATION_IN_MINUTE = 5;

    // AWS
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

    @IsUrl()
    @IsNotEmpty()
    HATCHED_WEBSITE_URL: string;

    @Type(() => Number)
    @IsNumber()
    NO_OF_VESTING_EMPLOYEES_TO_UPDATE: number;
}
