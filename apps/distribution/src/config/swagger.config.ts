import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../../../../package.json';

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hermes | Distribution Service Documentation')
    .setVersion(packageJson.version)
    .setDescription(
      'The Distribution Service implements a message queue design pattern by utilizing the @golevelup/nestjs-rabbitmq package. This ' +
        'package provides access to more advanced Rabbitmq features than the base @nestjs/microservices package, which strives to work ' +
        'with a variety of transport mechanisms. The Distribution Service listens for messages to be added on Rabbitmq queues and ' +
        "continues to process each until all are done. It's role is to determine who, how, and when a notification should be sent to for a given " +
        `message. If a notification(s) should be sent, the Distribution Service will create BullMQ job(s) on the "${process.env.BULLMQ_NOTIFICATION_QUEUE}" ` +
        'queue in Redis. For more details, check out the link below:',
    )
    .setExternalDoc(
      '@golevelup/nestjs-rabbitmq',
      'https://github.com/golevelup/nestjs',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: process.env.API_KEY_HEADER,
      },
      'ApiKeyAuth',
    )
    .addTag('Distribution Event', 'View and configure the events for a queue.')
    .addTag(
      'Distribution Log',
      'View the history of distribution job outcomes.',
    )
    .addTag(
      'Distribution Rule',
      'View and configure the rules that are used for evaluating a distribution event.',
    )
    .addTag(
      'Message',
      "Publish a message to a Rabbitmq Exchange to be forwarded it's bound exchanges/queues.",
    )
    .addTag(
      'Subscription',
      'View and configure subscriptions for a distribution event.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
