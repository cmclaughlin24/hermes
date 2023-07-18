import { ApiKeyGuard } from '@hermes/common';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { CreateEmailTemplateDto } from '../src/resources/email-template/dto/create-email-template.dto';
import { EmailTemplateModule } from '../src/resources/email-template/email-template.module';

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
        EmailTemplateModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
    }).compile();

    app = moduleFixture.createNestApplication();
    useGlobalPipes(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Email Template [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createEmailTemplateDto: CreateEmailTemplateDto = {
        name: 'e2e-test',
        subject: 'E2E Testing',
        template: '<h1></h1>',
        context: {},
      };

      // Act/Assert.
      return request(httpServer)
        .post('/email-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createEmailTemplateDto)
        .expect(HttpStatus.CREATED);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const createEmailTemplateDto = {
        name: 'e2e-test',
        subject: 'E2E Testing',
        context: null,
      };

      // Act/Assert.
      return request(httpServer)
        .post('/email-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createEmailTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const createEmailTemplateDto: CreateEmailTemplateDto = {
        name: 'e2e-test',
        subject: 'E2E Testing',
        template: '<h1></h1>',
        context: null,
      };

      // Act/Assert.
      return request(httpServer)
        .post('/email-template')
        .send(createEmailTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Email Templates [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/email-template').expect(HttpStatus.OK);
    });

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Email Template [GET /:name]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/email-template/e2e-test`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/email-template/unit-test`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Email Template [PATCH /:name]', () => {
    it.todo('should respond with an OK status if the resource was updated');

    it.todo(
      'should respond with a BAD_REQUEST status if the payload is invalid',
    );

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });

  describe('Remove Email Template [DELETE /:name]', () => {
    it.todo('should respond with an OK status if the resource was deleted');

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });
});
