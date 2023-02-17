import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupBullBoard } from './config/bull-board.config';
import { setupSwaggerDocument } from './config/swagger.config';
import { useGlobalPipes } from './config/use-global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupBullBoard(app);
  setupSwaggerDocument(app);
  useGlobalPipes(app);

  await app.listen(3000);
}
bootstrap();
