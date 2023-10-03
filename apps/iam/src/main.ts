if (process.env.ENABLE_OPEN_TELEMETRY === 'true') {
  require('./config/open-telemetry.config');
}

import { useOpenTelemetry } from '@hermes/open-telemetry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useGlobalPipes } from './config/use-global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    snapshot: true,
  });
  const port = process.env.PORT || 3002;

  useGlobalPipes(app);
  useOpenTelemetry(app);

  await app.listen(port);
}
bootstrap();
