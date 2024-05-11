import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle("Hatched backend")
        .setDescription("Hatched API description")
        .setVersion("1.0")
        .addTag("Hatched")
        .addBearerAuth({ in: "header", type: "http" })
        .build();

    const document = SwaggerModule.createDocument(app, options);

    // see https://github.com/swagger-api/swagger-js/issues/1425
    // see https://github.com/swagger-api/swagger-editor/issues/1892
    const reorderedDocument = {
        "openapi": document.openapi,
        "info": document.info,
        "tags": document.tags,
        "servers": document.servers,
        "paths": document.paths,
        "components": document.components,
    }

    SwaggerModule.setup("docs", app, reorderedDocument);
}
