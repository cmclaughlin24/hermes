import { IamModule, IamModuleOptions } from '@hermes/iam';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { CreateEmailTemplateDto } from '../src/resources/email-template/dto/create-email-template.dto';
import { EmailTemplateModule } from '../src/resources/email-template/email-template.module';
import { createTokenServiceMock } from './helpers/provider.helper';

const [tokenService, setActiveEntityData] = createTokenServiceMock();

describe('[Feature] Email Template', () => {
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
        IamModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): IamModuleOptions => ({
            apiKeyHeader: configService.get('API_KEY_HEADER'),
            tokenService,
          }),
        }),
        EmailTemplateModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    useGlobalPipes(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  beforeEach(() => {
    setActiveEntityData.mockReturnValue({
      sub: randomUUID(),
      authorization_details: ['email_template=create,update,remove'],
    });
  });

  afterEach(() => {
    setActiveEntityData.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Email Template [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createEmailTemplateDto: CreateEmailTemplateDto = {
        name: templateName,
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
        name: templateName,
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

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const createEmailTemplateDto: CreateEmailTemplateDto = {
        name: templateName,
        subject: 'E2E Testing',
        template: '<h1></h1>',
        context: null,
      };

      // Act/Assert.
      return request(httpServer)
        .post('/email-template')
        .send(createEmailTemplateDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const createEmailTemplateDto: CreateEmailTemplateDto = {
        name: templateName,
        subject: 'E2E Testing',
        template: '<h1></h1>',
        context: null,
      };
      setActiveEntityData.mockReturnValueOnce({
        sub: randomUUID(),
        authorization_details: ['email_template=update,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .post('/email-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
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

  describe('Get Email Template [GET /:deliveryMethod/:name]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/email-template/${templateName}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/email-template/unit-test`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Email Template [PATCH /:deliveryMethod/:name]]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Arrange.
      const updateEmailTemplateDto = {
        template: '<h1>End-to-End Testing</h1>',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/email-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateEmailTemplateDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const updateEmailTemplateDto = {
        template: '',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/email-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateEmailTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const updateEmailTemplateDto = {
        template: '<h1>End-to-End Testing</h1>',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/email-template/${templateName}`)
        .send(updateEmailTemplateDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const updateEmailTemplateDto = {
        template: '<h1>End-to-End Testing</h1>',
      };
      setActiveEntityData.mockReturnValueOnce({
        sub: randomUUID(),
        authorization_details: ['email_template=create,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .patch(`/email-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateEmailTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Arrange.
      const updateEmailTemplateDto = {
        template: '<h1>End-to-End Testing</h1>',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/email-template/unit-test`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateEmailTemplateDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Email Template [DELETE /:deliveryMethod/:name]]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/email-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/email-template/${templateName}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      setActiveEntityData.mockReturnValueOnce({
        sub: randomUUID(),
        authorization_details: ['email_template=create,update'],
      });

      // Act/Assert.
      return request(httpServer)
        .delete(`/email-template/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/email-template/unit-test`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
