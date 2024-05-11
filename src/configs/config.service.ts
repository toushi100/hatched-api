import { DotenvParseOutput, parse } from "dotenv";
import { existsSync, readFileSync } from "fs";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { EnvConfig } from "./env-config";
import { transformAndValidateSync } from "class-transformer-validator";
import * as path from "path";
import { AwsConfig } from "./aws-config";

export class ConfigService {
    readonly ENV_CONFIG: EnvConfig;

    constructor(environment: string) {
        console.log(environment);
        const filePath = path.join(`env/${environment}.env`);
        if (existsSync(filePath)) {
            const configJson = parse(readFileSync(filePath));
            this.ENV_CONFIG = this.validateAndGetEnvConfig(configJson);
        } else {
            const globalSecretEnv = JSON.parse(process.env.GLOBAL_SECRET_ENV || "{}");
            const globalPublicEnv = JSON.parse(process.env.GLOBAL_PUBLIC_ENV || "{}");
            this.ENV_CONFIG = this.validateAndGetEnvConfig({
                ...globalSecretEnv,
                ...globalPublicEnv,
            });
        }
    }

    validateAndGetEnvConfig(configJson: DotenvParseOutput): EnvConfig {
        try {
            return transformAndValidateSync(EnvConfig, configJson);
        } catch (err) {
            throw new Error(`.env Config validation error: ${err}`);
        }
    }

    get isDevelopment(): boolean {
        return this.ENV_CONFIG.NODE_ENV === "development";
    }

    private isTrue(value): boolean {
        return value === "true";
    }

    get typeOrmConfig(): TypeOrmModuleOptions {
        const baseDir = path.join(__dirname, "..");
        console.log(`basePath for entities ${baseDir + "/{modules,shared}/**/*.entity{.ts,.js}"}`);
        return {
            type: "postgres",
            host: this.ENV_CONFIG.DATABASE_HOST,
            port: +this.ENV_CONFIG.DATABASE_PORT,
            username: this.ENV_CONFIG.DATABASE_USER,
            password: this.ENV_CONFIG.DATABASE_PASSWORD,
            database: this.ENV_CONFIG.DATABASE_NAME,
            subscribers: [],
            migrationsRun: this.ENV_CONFIG.TYPEORM_MIGRATIONS,
            logging: this.isDevelopment,
            autoLoadEntities: false,
            synchronize: this.ENV_CONFIG.TYPEORM_SYNCHRONIZE,
            entities: [baseDir + "/{modules,shared}/**/*.entity{.ts,.js}"],
            migrations: [baseDir + "/migrations/**/*{.ts,.js}"],
            migrationsTableName: "migrations",
            ssl: {
                rejectUnauthorized: false
            },
            cli: {
                migrationsDir: "src/migrations",
            },
        };
    }

    get awsConfig(): AwsConfig {
        return {
            AWS_ACCESS_KEY_ID: this.ENV_CONFIG.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: this.ENV_CONFIG.AWS_SECRET_ACCESS_KEY,
            AWS_REGION: this.ENV_CONFIG.AWS_REGION,
            AWS_S3_BUCKET_NAME: this.ENV_CONFIG.AWS_S3_BUCKET_NAME,
        };
    }
}
