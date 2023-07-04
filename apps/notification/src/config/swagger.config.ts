import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../../../../package.json';

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hermes | Notification Service Documentation')
    .setVersion(packageJson.version)
    .setDescription(
      'The Notification Service implements a message queue design pattern by utilizing the @nestjs/bullmq package. This ' +
        'package provides a layer of abstraction for the BullMQ library, a robust message queue system based on Redis. ' +
        'It allows for more a reliable communication channel between the Notification Service and other services ' +
        'by persisting job data and application state so that task handling can be easily restarted. The Notification ' +
        `Service listens for jobs to be added to the "${process.env.BULLMQ_NOTIFICATION_QUEUE}" queue and continues to process ` +
        "each until all are done. It's role is to send a notification to the delivery method specified in the job. For " +
        'details on NestJS Queues check out the link below:',
    )
    .setExternalDoc(
      'NestJS Queues',
      'https://docs.nestjs.com/techniques/queues',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: process.env.API_KEY_HEADER,
      },
      'ApiKeyAuth',
    )
    .addTag(
      'Health',
      'Monitor the overall health, status, and availability of the application.',
    )
    .addTag(
      'Email Template',
      'View and configure templates that may be used when sending emails.',
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
    .addTag(
      'Phone Template',
      'View and configure templates that may be used when sending SMS or making calls.',
    )
    .addTag(
      'Push Template',
      'View and configure templates that may be used when sending push notifications.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
