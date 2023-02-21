import { BullModule } from '@nestjs/bull';
import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { bullFactory } from '../src/config/bull.config';
import { NotificationJobModule } from '../src/resources/notification-job/notification-job.module';

describe('[Feature] Notification Job', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: bullFactory,
        }),
        NotificationJobModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  it.todo('Create Email Job [POST /email]');

  it.todo('Create SMS Job [POST /sms]');

  it.todo('Create Radio Job [POST /radio]');
});
