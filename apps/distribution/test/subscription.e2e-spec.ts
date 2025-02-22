import { DeliveryMethods } from '@hermes/common';
import { IamModule, IamModuleOptions } from '@hermes/iam';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { FilterJoinOps, FilterOps } from '../src/common/types/filter.type';
import { SubscriptionType } from '../src/common/types/subscription-type.type';
import { useGlobalPipes } from '../src/config/use-global.config';
import { DistributionEventModule } from '../src/resources/distribution-event/distribution-event.module';
import { CreateDistributionEventDto } from '../src/resources/distribution-event/dto/create-distribution-event.dto';
import { DistributionRuleModule } from '../src/resources/distribution-rule/distribution-rule.module';
import { CreateSubscriptionDto } from '../src/resources/subscription/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../src/resources/subscription/dto/update-subscription.dto';
import { SubscriptionModule } from '../src/resources/subscription/subscription.module';
import { createTokenServiceMock } from './helpers/provider.helper';

const [tokenService, setActiveEntityData] = createTokenServiceMock();

describe('[Feature] Subscription', () => {
  let app: INestApplication;
  let httpServer: App;

  const eventType = 'e2e-test__subscription';
  const subscriberId = 'e2e-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/env/e2e.env`,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
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
        SubscriptionModule,
        DistributionEventModule,
        DistributionRuleModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    useGlobalPipes(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  beforeAll(async () => {
    // Note: Create Distribution Event to be used during test run.
    const createDistributionEventDto: CreateDistributionEventDto = {
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
    setActiveEntityData.mockReturnValue({
      sub: randomUUID(),
      authorization_details: ['distribution_event=create,remove'],
    });

    await request(httpServer)
      .post('/distribution-event')
      .set(process.env.API_KEY_HEADER, process.env.API_KEY)
      .send(createDistributionEventDto);
  });

  beforeEach(() => {
    setActiveEntityData.mockReturnValue({
      sub: randomUUID(),
      authorization_details: [
        'distribution_event=create,remove',
        'subscription=create,update,remove',
      ],
    });
  });

  afterEach(() => {
    setActiveEntityData.mockClear();
  });

  afterAll(async () => {
    // Note: Remove Distribution Event used during test run.
    await request(httpServer)
      .delete(`/distribution-event/${eventType}`)
      .set(process.env.API_KEY_HEADER, process.env.API_KEY);

    await app.close();
  });

  describe('Create Subscription [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
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

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
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
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
        eventType: eventType,
        subscriberId: subscriberId,
        subscriptionType: SubscriptionType.REQUEST,
        data: {
          url: '',
          id: 'The GameBoy was the first video game console played in space.',
        },
        filterJoin: FilterJoinOps.AND,
        filters: [],
      };
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['subscription=update,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .post('/subscription')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createSubscriptionDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the distribution event does not exist', () => {
      // Arrange.
      const createSubscriptionDto: CreateSubscriptionDto = {
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

  describe('Get Subscription [GET /:eventType/:subscriberId]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/subscription/${eventType}/${subscriberId}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/subscription/${eventType}/${subscriberId}-not-found`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Subscription [PATCH /:eventType/:subscriberId]', () => {
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
        .patch(`/subscription/${eventType}/${subscriberId}`)
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
        .patch(`/subscription/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        filterJoin: FilterJoinOps.NOT,
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${eventType}/${subscriberId}`)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        filterJoin: FilterJoinOps.NOT,
      };
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['subscription=create,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .patch(`/subscription/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
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
        .patch(`/subscription/${eventType}/${subscriberId}-not-found`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateSubscriptionDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Subscriptions [DELETE /:subscriberId]', () => {
    // Todo: Implement E2E Tests for removing a subscriber from all distribution events.
  });

  describe('Remove Subscription [DELETE /:eventType/:subscriberId]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${eventType}/${subscriberId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['subscription=create,update'],
      });

      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${eventType}/${subscriberId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/subscription/${eventType}/${subscriberId}-not-found`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
