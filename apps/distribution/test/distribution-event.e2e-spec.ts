import { DeliveryMethods } from '@hermes/common';
import { IamModule } from '@hermes/iam';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { DistributionEventModule } from '../src/resources/distribution-event/distribution-event.module';
import { CreateDistributionEventDto } from '../src/resources/distribution-event/dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from '../src/resources/distribution-event/dto/update-distribution-event.dto';
import { DistributionRuleModule } from '../src/resources/distribution-rule/distribution-rule.module';
import { SubscriptionModule } from '../src/resources/subscription/subscription.module';

describe('[Feature] Distribution Event', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const queueName = 'e2e-test';
  const eventType = 'e2e-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/env/distribution.env`,
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
        IamModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            apiKeyHeader: configService.get('API_KEY_HEADER'),
            apiKeys: configService.get('API_KEY'),
          }),
        }),
        DistributionEventModule,
        DistributionRuleModule,
        SubscriptionModule,
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

  describe('Create Distribution Event [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createDistributionEventDto: CreateDistributionEventDto = {
        queue: queueName,
        eventType: eventType,
        metadataLabels: ['languageCode'],
        rules: [
          {
            metadata: null,
            deliveryMethods: [DeliveryMethods.SMS],
            text: 'Metroid was first released in 1986 for the Nintendo Entertainment System (NES)',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-event')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionEventDto)
        .expect(HttpStatus.CREATED);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid (missing fields)', () => {
      // Arrange.
      const createDistributionEventDto = {
        queue: queueName,
        rules: [
          {
            metadata: null,
            deliveryMethods: [DeliveryMethods.SMS],
            text: 'Star Fox the first games to utilize the Super FX chip, allowing for 3D polygonal graphics on the SNES.',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-event')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionEventDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid (no default rule)', () => {
      // Arrange.
      const createDistributionEventDto: CreateDistributionEventDto = {
        queue: queueName,
        eventType: `${eventType}-2`,
        metadataLabels: ['languageCode'],
        rules: [
          {
            metadata: JSON.stringify({ languageCode: 'en-US' }),
            deliveryMethods: [DeliveryMethods.SMS],
            text: "F-Zero GX, released for the Nintendo GameCube in 2003, was a collaboration between Nintendo and Sega's Amusement Vision team.",
          },
        ],
      };
      const expectedResponse = {
        statusCode: 400,
        message: `Distribution Event for queue=${createDistributionEventDto.queue} eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
        error: 'Bad Request',
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-event')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionEventDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(expectedResponse);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const createDistributionEventDto: CreateDistributionEventDto = {
        queue: queueName,
        eventType: eventType,
        metadataLabels: ['languageCode'],
        rules: [
          {
            metadata: null,
            deliveryMethods: [DeliveryMethods.SMS],
            text: 'Metroid was first released in 1986 for the Nintendo Entertainment System (NES)',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-event')
        .send(createDistributionEventDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Get Distribution Events [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-event')
        .expect(HttpStatus.OK);
    });

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Distribution Event [GET /:queue/:eventType', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/distribution-event/${queueName}/${eventType}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/distribution-event/${queueName}/${eventType}-2`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Distribution Event [PATCH /:queue/:eventType]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Arrange.
      const updateDistributionEventDto: UpdateDistributionEventDto = {
        metadataLabels: ['languageCode', 'region'],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-event/${queueName}/${eventType}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionEventDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST status if payload is invalid', () => {
      // Arrange.
      const updateDistributionEventDto = {
        metadataLabels: 1995,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-event/${queueName}/${eventType}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionEventDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const updateDistributionEventDto: UpdateDistributionEventDto = {
        metadataLabels: ['languageCode', 'region'],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-event/${queueName}/${eventType}`)
        .send(updateDistributionEventDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Arrange.
      const updateDistributionEventDto: UpdateDistributionEventDto = {
        metadataLabels: ['languageCode', 'region'],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-event/${queueName}/${eventType}-2`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionEventDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Distribution Event [DELETE /:queue/:eventType]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-event/${queueName}/${eventType}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-event/${queueName}/${eventType}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-event/${queueName}/${eventType}-2`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
