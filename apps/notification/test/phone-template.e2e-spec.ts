import { DeliveryMethods } from '@hermes/common';
import { IamModule, IamModuleOptions } from '@hermes/iam';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { CreatePhoneTemplateDto } from '../src/resources/phone-template/dto/create-phone-template.dto';
import { PhoneTemplateModule } from '../src/resources/phone-template/phone-template.module';

const tokenService = {
  verifyApiKey: async function (apiKey) {
    if (apiKey === process.env.API_KEY) {
      return {
        sub: randomUUID(),
        authorization_details: ['phone_template=create,update,remove'],
      };
    }
    return null;
  },
};

describe('[Feature] Phone Template', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const templateName = 'e2e-test';

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
        PhoneTemplateModule,
      ],
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

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
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
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it.todo(
      'should respond with a FORBIDDEN status if the requester does not have sufficient permissions',
    );
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

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const updatePhoneTemplateDto = {
        template:
          'Crash Bandicoot was originally supposed to be wombat named Willie',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .send(updatePhoneTemplateDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it.todo(
      'should respond with a FORBIDDEN status if the requester does not have sufficient permissions',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });

  describe('Remove Phone Template [DELETE /:deliveryMethod/:name]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.SMS}/${templateName}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it.todo(
      'should respond with a FORBIDDEN status if the requester does not have sufficient permissions',
    );

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/phone-template/${DeliveryMethods.CALL}/${templateName}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
