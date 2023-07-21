import { ApiKeyGuard } from '@hermes/common';
import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { useGlobalPipes } from '../src/config/use-global.config';
import { PushTemplateModule } from '../src/resources/push-template/push-template.module';

describe('[Feature] Push Template', () => {
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
        PushTemplateModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
    }).compile();

    app = moduleFixture.createNestApplication();
    useGlobalPipes(app);
    await app.init;
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Push Template [POST /]', () => {
    it.todo('should respond with a CREATED status if the resource was created');

    it.todo(
      'should respond with a BAD_REQUEST status if the payload is invalid',
    );

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );
  });

  describe('Get Push Templates [GET /]', () => {
    it.todo('should respond with an OK status if resource(s) were found');

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Push Template [GET /:name)', () => {
    it.todo('should respond with an OK status if the resource exists');

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });

  describe('Update Push Template [PATCH /:name]', () => {
    it.todo('should respond with an OK status if the resource was updated');

    it.todo(
      'should respond with a BAD_REQUEST status if the payload is invalid',
    );

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status is the resource does not exist',
    );
  });

  describe('Remove Push Template [DELETE /:name]', () => {
    it.todo('should respond with an OK status if the resouce was deleted');

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });
});
