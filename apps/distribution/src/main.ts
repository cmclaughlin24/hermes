import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { setupSwaggerDocument } from './config/swagger.config';
import { useGlobalPipes } from './config/use-global.config';

if (process.env.ENABLE_OPEN_TELEMETRY === 'true') {
  require('./config/open-telemetry.config');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    snapshot: true,
  });
  const port = process.env.PORT || 3001;

  setupSwaggerDocument(app);
  useGlobalPipes(app);
  // Note: Allows class-validator to use NestJS dependency injection
  //       (required for custom validators that check database)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(port);
}
bootstrap();
