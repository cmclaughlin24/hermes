import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../../../../package.json';
import { API_KEY_HEADER } from '../common/guards/api-key.guard';

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Notification Service Documentation')
    .setVersion(packageJson.version)
    .setDescription(
      'The Notification Service implements a Queue design pattern by utilizing the @nestjs/bull package. This ' +
        'package provides a layer of abstraction for the Bull library, a robust queue system based on Redis. ' +
        'It allows for more a reliable communication channel between the Notification Service and other services ' +
        'by persisting job data and application state so that task handling can be easily restarted. The Notification ' +
        'Service listens for jobs to be added to the "notification" queue and continues to process each until all ' +
        'are done. For details on NestJS Queues check out the link below:',
    )
    .setExternalDoc(
      'NestJS Queues',
      'https://docs.nestjs.com/techniques/queues',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: API_KEY_HEADER,
      },
      'ApiKeyAuth',
    )
    .addTag(
      'Email Template',
      'View and configure Handlebars email templates that may be used when sending emails.',
    )
    .addTag(
      'Notification',
      'Send a notification via an available delivery method.',
    )
    .addTag(
      'Notification Job',
      'Schedule a notification to be sent by pushing a job with the corresponding delivery method name on to the notification queue.',
    )
    .addTag(
      'Notification Log',
      'View the history of notification job outcomes.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
