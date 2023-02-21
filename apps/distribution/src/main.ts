import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwaggerDocument } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;

  setupSwaggerDocument(app);

  await app.listen(port);
}
bootstrap();
