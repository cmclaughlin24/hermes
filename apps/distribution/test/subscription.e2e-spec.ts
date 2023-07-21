import { ApiKeyGuard, DeliveryMethods } from '@hermes/common';
import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { useGlobalPipes } from '../src/config/use-global.config';
import { DistributionEventModule } from '../src/resources/distribution-event/distribution-event.module';
import { CreateDistributionEventDto } from '../src/resources/distribution-event/dto/create-distribution-event.dto';
import { DistributionRuleModule } from '../src/resources/distribution-rule/distribution-rule.module';
import { SubscriptionModule } from '../src/resources/subscription/subscription.module';

describe('[Feature] Subscription', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const queueName = 'e2e-test';
  const eventType = 'e2e-test__subscription';

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
          text: 'Tomb Raider was first released in 1996 by Core Design and published by Eidos Interactive. It was later transferred to Crystal Dynamics.',
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
    it.todo('should respond with a CREATED status if the resource was created');

    it.todo(
      'should respond with a BAD_REQUEST status if the payload is invalid',
    );

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the distribution event does not exist',
    );
  });

  describe('Get Subscriptions [GET /]', () => {
    it.todo('should respond with an OK status if resource(s) were found');

    it.todo(
      'should respond with a NOT_FOUND status if resource(s) were not found',
    );
  });

  describe('Get Subscription [GET /:queue/:eventType/:subscriberId]', () => {
    it.todo('should respond with an OK status if the resource exists');

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });

  describe('Update Subscription [PATCH /:queue/:eventType/:subscriberId]', () => {
    it.todo('should respond with an OK status if the resource was updated');

    it.todo('should respond with a BAD_REQUEST if the payload is invalid');

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });

  describe('Remove Subscriptions [DELETE /:subscriberId]', () => {});

  describe('Remove Subscription [DELETE /:queue/:eventType/:subscriberId]', () => {
    it.todo('should respond with an OK status if the resource was deleted');

    it.todo(
      'should respond with a FORBIDDEN status if the request is not authorized',
    );

    it.todo(
      'should respond with a NOT_FOUND status if the resource does not exist',
    );
  });
});
