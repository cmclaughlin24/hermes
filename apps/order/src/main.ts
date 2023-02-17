import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwaggerDocument } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwaggerDocument(app);

  await app.listen(3001);
}
bootstrap();
