if (process.env.ENABLE_OPEN_TELEMETRY === 'true') {
  require('./config/open-telemetry.config');
}

import { useOpenTelemetry } from '@hermes/open-telemetry';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { setupSwaggerDocument } from './config/swagger.config';
import { useGlobalPipes } from './config/use-global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    snapshot: true,
  });
  const port = process.env.PORT || 3001;

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  setupSwaggerDocument(app);
  useGlobalPipes(app);
  // Note: Allows class-validator to use NestJS dependency injection
  //       (required for custom validators that check database)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  useOpenTelemetry(app);

  await app.listen(port);
}
bootstrap();
