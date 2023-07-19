import { ApiKeyGuard, DeliveryMethods } from '@hermes/common';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { CreatePhoneTemplateDto } from '../src/resources/phone-template/dto/create-phone-template.dto';
import { PhoneTemplateModule } from '../src/resources/phone-template/phone-template.module';

describe('[Feature] Phone Template', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const templateName = 'e2e-test';

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
        PhoneTemplateModule,
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

  describe('Create Phone Template [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createPhoneTemplateDto: CreatePhoneTemplateDto = {
        deliveryMethod: DeliveryMethods.SMS,
        name: templateName,
        template:
          "Mario's cap and overalls were initially due to graphical limiations of arcade machines",
        context: {},
      };

      // Act/Assert.
      return request(httpServer)
        .post('/phone-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createPhoneTemplateDto)
        .expect(HttpStatus.CREATED);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const createPhoneTemplateDto = {
        deliveryMethod: DeliveryMethods.SMS,
        name: templateName,
      };

      // Act/Assert.
      return request(httpServer)
        .post('/phone-template')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createPhoneTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const createPhoneTemplateDto: CreatePhoneTemplateDto = {
        deliveryMethod: DeliveryMethods.SMS,
        name: templateName,
        template: '',
        context: {},
      };

      // Act/Assert.
      return request(httpServer)
        .post('/phone-template')
        .send(createPhoneTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Phone Templates [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/phone-template').expect(HttpStatus.OK);
    });

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Phone Template [GET /:deliveryMethod/:name]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/phone-template/${DeliveryMethods.CALL}/${templateName}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Phone Template [PATCH /:deliveryMethod/:name]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Arrange.
      const updatePhoneTemplateDto = {
        template:
          "Crash Bandicoot was supposed to be Sony's mascot to rival Mario and Sonic",
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updatePhoneTemplateDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const updatePhoneTemplateDto = {
        template: '',
        context: null,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updatePhoneTemplateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const updatePhoneTemplateDto = {
        template:
          'Crash Bandicoot was originally supposed to be wombat named Willie',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .send(updatePhoneTemplateDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Remove Phone Template [DELETE /:deliveryMethod/:name]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.CALL}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
