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
    .addTag(
      'Distribution Job',
      'Schedule a job to be pushed to the corresponding queue.',
    )
    .addTag(
      'Distribution Log',
      'View the history of distribution job outcomes.',
    )
    .addTag(
      'Distribution Rules',
      'View and configure the rules that are used for evaluating a distribution job.'
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
