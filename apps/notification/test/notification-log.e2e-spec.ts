import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationLogModule } from '../src/resources/notification-log/notification-log.module';
import { NotificationLogService } from '../src/resources/notification-log/notification-log.service';

describe('[Feature] Notification Log', () => {
  let app: INestApplication;
  let httpServer: HttpServer;
  let notificationLogService: NotificationLogService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/env/notification.env`,
        }),
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            dialect: 'postgres',
            host: 'localhost',
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            autoLoadModels: true,
            synchronize: true,
            logging: false,
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
    // Note: Create several notification log entries for E2E test cases.
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get Notification Logs [GET /]', () => {
    it.todo('should respond with an OK status if resource(s) were found');

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Notification Logs [GET /:id]', () => {
    it.todo('should respond with an OK status if the resource exists');

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });
});
