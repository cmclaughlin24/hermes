import { ApiKeyGuard } from '@hermes/common';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { PushTemplateModule } from '../src/resources/push-template/push-template.module';

describe('[Feature] Push Template', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const templateName = 'e2e-testing';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/env/e2e.env`,
        }),
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            dialect: 'postgres',
            host: configService.get('DB_HOST'),
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
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Push Template [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createPushTemplateDto = {
        name: templateName,
        title: 'Best Selling Console',
        body: 'The PS2 is the best selling console of all time, with over 155 million units sold world wide.',
      };

      // Act/Assert.
      return request(httpServer)
        .post('/push-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createPushTemplateDto)
        .expect(HttpStatus.CREATED);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const createPushTemplateDto = {
        name: templateName,
        body: "The PS2 was also compatible with DVD movies, making it one of the most affordable DVD players of it's time.",
      };

      // Act/Assert.
      return request(httpServer)
        .post('/push-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createPushTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const createPushTemplateDto = {
        name: templateName,
        title: 'Best Selling Console',
        body: 'The PS2 is the best selling console of all time, with over 155 million units sold world wide.',
      };

      // Act/Assert.
      return request(httpServer)
        .post('/push-template')
        .send(createPushTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Push Templates [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/push-template').expect(HttpStatus.OK);
    });

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Push Template [GET /:name)', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/push-template/${templateName}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/push-template/${templateName}-invalid`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Push Template [PATCH /:name]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Assert.
      const updatePushTemplateDto = {
        actions: [
          {
            action: 'DISMISS',
            title: 'Dismiss',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/push-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updatePushTemplateDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Assert.
      const updatePushTemplateDto = {
        renotify: 12345,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/push-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updatePushTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Assert.
      const updatePushTemplateDto = {
        actions: [
          {
            action: 'CONFIRM',
            title: 'Confirm',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/push-template/${templateName}`)
        .send(updatePushTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status is the resource does not exist', () => {
      // Assert.
      const updatePushTemplateDto = {
        renotify: true,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/push-template/${templateName}-invalid`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updatePushTemplateDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Push Template [DELETE /:name]', () => {
    it('should respond with an OK status if the resouce was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/push-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/push-template/${templateName}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/push-template/${templateName}-invalid`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
