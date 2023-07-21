import { ApiKeyGuard, DeliveryMethods } from '@hermes/common';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { FilterJoinOps, FilterOps } from '../src/common/types/filter.type';
import { SubscriptionType } from '../src/common/types/subscription-type.type';
import { useGlobalPipes } from '../src/config/use-global.config';
import { DistributionEventModule } from '../src/resources/distribution-event/distribution-event.module';
import { CreateDistributionEventDto } from '../src/resources/distribution-event/dto/create-distribution-event.dto';
import { DistributionRuleModule } from '../src/resources/distribution-rule/distribution-rule.module';
import { CreateSubscriptionDto } from '../src/resources/subscription/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../src/resources/subscription/dto/update-subscription.dto';
import { SubscriptionModule } from '../src/resources/subscription/subscription.module';

describe('[Feature] Subscription', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const queueName = 'e2e-test';
  const eventType = 'e2e-test__subscription';
  const subscriberId = 'e2e-test';

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
        SubscriptionModule,
        DistributionEventModule,
        DistributionRuleModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
    }).compile();

    app = moduleFixture.createNestApplication();
    useGlobalPipes(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  beforeAll(async () => {
    // Note: Create Distribution Event to be used during test run.
    const createDistributionEventDto: CreateDistributionEventDto = {
      queue: queueName,
      eventType: eventType,
      metadataLabels: ['videoGame'],
      rules: [
        {
          metadata: null,
          deliveryMethods: [DeliveryMethods.CALL],
          text: 'Super Mario Kart was released for the Super Nintendo Entertainment System (SNES) in 1992.',
        },
      ],
    };

    await request(httpServer)
      .post('/distribution-event')
      .set(process.env.API_KEY_HEADER, process.env.API_KEY)
      .send(createDistributionEventDto);
  });

  afterAll(async () => {
    // Note: Remove Distribution Event used during test run.
    await request(httpServer)
      .delete(`/distribution-event/${queueName}/${eventType}`)
      .set(process.env.API_KEY_HEADER, process.env.API_KEY);

    await app.close();
  });

  describe('Create Subscription [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
        queue: queueName,
        eventType: eventType,
        subscriberId: subscriberId,
        subscriptionType: SubscriptionType.REQUEST,
        data: {
          url: '',
          id: "Cuphead's art style is inspired by the 1930s cartoons.",
        },
        filterJoin: FilterJoinOps.AND,
        filters: [],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/subscription')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createSubscriptionDto)
        .expect(HttpStatus.CREATED);
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const createSubscriptionDto = {
        queue: queueName,
        eventType: eventType,
        filterJoin: FilterJoinOps.AND,
        filters: [],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/subscription')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createSubscriptionDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
        queue: queueName,
        eventType: eventType,
        subscriberId: subscriberId,
        subscriptionType: SubscriptionType.REQUEST,
        data: {
          url: '',
          id: 'Insomniac Games originally intended for Ratchet to wield a sword as his primary weapon',
        },
        filterJoin: FilterJoinOps.AND,
        filters: [],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/subscription')
        .send(createSubscriptionDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the distribution event does not exist', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
        queue: queueName,
        eventType: `${eventType}-not-found`,
        subscriberId: subscriberId,
        subscriptionType: SubscriptionType.REQUEST,
        data: {
          url: '',
          id: 'The GBA featured a 32-bit CPU and a 16-bit graphics processor',
        },
        filterJoin: FilterJoinOps.AND,
        filters: [],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/subscription')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createSubscriptionDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Subscriptions [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/subscription').expect(HttpStatus.OK);
    });

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Subscription [GET /:queue/:eventType/:subscriberId]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/subscription/${queueName}/${eventType}/${subscriberId}-not-found`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Subscription [PATCH /:queue/:eventType/:subscriberId]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Arrange.
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        filters: [
          {
            field: 'consoleType',
            operator: FilterOps.EQUALS,
            dataType: 'string',
            value: 'handheld',
          },
        ],
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST if the payload is invalid', () => {
      // Arrange.
      const updateSubscriptionDto = {
        filterJoin: 'invalid',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Arrange.
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        filterJoin: FilterJoinOps.NOT,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Arrange.
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        data: {
          id: '',
          url: 'The Nintendo DS introduced the concept of dual-screen gaming to handheld consoles',
        },
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${queueName}/${eventType}/${subscriberId}-not-found`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Subscriptions [DELETE /:subscriberId]', () => {
    // Todo: Implement E2E Tests for removing a subscriber from all distribution events.
  });

  describe('Remove Subscription [DELETE /:queue/:eventType/:subscriberId]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a FORBIDDEN status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${queueName}/${eventType}/${subscriberId}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${queueName}/${eventType}/${subscriberId}-not-found`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
