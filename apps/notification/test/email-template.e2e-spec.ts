import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseFactory } from '../src/config/database.config';
import { EmailTemplateModule } from '../src/resources/email-template/email-template.module';

console.log(`${process.cwd()}/env/notification.env`)

describe('[Feature] Email Template', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

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
          useFactory: databaseFactory,
        }),
        EmailTemplateModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it.todo('Create Email Template [POST /]');

  it.todo('Get Email Templates [GET /]');

  it.todo('Get Email Template [GET /:name]');

  it.todo('Update Email Template [PATCH /:name]');

  it.todo('Remove Email Template [DELETE /:name]');
});
