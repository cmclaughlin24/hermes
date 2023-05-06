import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../../../../package.json';

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Distribution Service Documentation')
    .setVersion(packageJson.version)
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: process.env.API_KEY_HEADER,
      },
      'ApiKeyAuth',
    )
    .addTag(
      'Distribution Log',
      'View the history of distribution job outcomes.',
    )
    .addTag(
      'Distribution Rule',
      'View and configure the rules that are used for evaluating a message type from a queue.',
    )
    .addTag(
      'Message',
      "Publish a message to a Rabbitmq Exchange to be forwarded it's bound exchanges/queues.",
    )
    .addTag(
      'Subscription',
      'View and configure subscriptions for a queue and message type.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
}
