import { NestFactory, Reflector } from "@nestjs/core";
import * as compression from "compression";
import * as helmet from "helmet";
// import * as csurf from 'csurf';
import * as rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { ConfigService } from "./configs";
import { setupSwagger } from "./swagger";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { ExpressAdapter, NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
        { cors: true, bodyParser: true },
    );
    const configService: ConfigService = app.get(ConfigService);

    // middlewares
    app.setGlobalPrefix("/api");
    app.enableCors();
    app.use(compression());

    // https://github.com/nestjs/swagger/issues/1006
    setupSwagger(app);

    app.use(helmet());
    // app.use(csurf());
    // app.use(
    //     new rateLimit({
    //         windowMs: configService.getNumber("RATE_LIMIT_WINDOW"),
    //         max: configService.getNumber("RATE_LIMIT_MAX"),
    //     }),
    // );

    const reflector = app.get(Reflector);

    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const port = configService.ENV_CONFIG.PORT;
    await app.listen(port);

    console.info(`server running on port ${port}::  `);

    // await app.listen(configService.getNumber("PORT") || 5000);
}
bootstrap();
