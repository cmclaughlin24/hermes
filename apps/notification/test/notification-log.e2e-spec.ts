import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { NotificationLogModule } from '../src/resources/notification-log/notification-log.module';
import { NotificationLogService } from '../src/resources/notification-log/notification-log.service';

describe('[Feature] Notification Log', () => {
  let app: INestApplication;
  let httpServer: App;
  let notificationLogService: NotificationLogService;

  const jobName = 'e2e-test__notification-log';
  let logId;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/env/e2e.env`,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
        NotificationLogModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    notificationLogService = moduleFixture.get<NotificationLogService>(
      NotificationLogService,
    );
  });

  beforeAll(async () => {
    // Note: Create notification log entrie(s) for E2E test cases.
    const job = {
      name: jobName,
      attemptsMade: 1,
      timestamp: new Date(),
      finishedOn: new Date(),
      processedOn: new Date(),
      data: {},
    } as unknown as Job;

    logId = await notificationLogService.log(
      job,
      'failed',
      null,
      new Error('Something went wrong!'),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get Notification Logs [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/notification-log').expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if resource(s) were not found', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/notification-log')
        .query({ job: 'xenoblade-chronicles' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Notification Logs [GET /:id]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/notification-log/${logId}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-log/86121803-f171-4271-85c2-4ac58d8f722f')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
