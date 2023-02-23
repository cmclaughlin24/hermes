import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { setupSwaggerDocument } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = await app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });
  const port = process.env.PORT || 3001;

  setupSwaggerDocument(app);

  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
