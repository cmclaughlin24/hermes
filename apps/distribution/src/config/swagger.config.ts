import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_KEY_HEADER } from '@notification/common';
import * as packageJson from '../../../../package.json';

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Distribution Service Documentation')
    .setVersion(packageJson.version)
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: API_KEY_HEADER,
      },
      'ApiKeyAuth',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
