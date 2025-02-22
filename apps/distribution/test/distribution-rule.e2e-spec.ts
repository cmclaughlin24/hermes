import { DeliveryMethods } from '@hermes/common';
import { IamModule, IamModuleOptions } from '@hermes/iam';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { useGlobalPipes } from '../src/config/use-global.config';
import { DistributionEventModule } from '../src/resources/distribution-event/distribution-event.module';
import { CreateDistributionEventDto } from '../src/resources/distribution-event/dto/create-distribution-event.dto';
import { DistributionRuleModule } from '../src/resources/distribution-rule/distribution-rule.module';
import { CreateDistributionRuleDto } from '../src/resources/distribution-rule/dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from '../src/resources/distribution-rule/dto/update-distribution-rule.dto';
import { SubscriptionModule } from '../src/resources/subscription/subscription.module';
import { createTokenServiceMock } from './helpers/provider.helper';

const [tokenService, setActiveEntityData] = createTokenServiceMock();

describe('[Feature] Distribution Rule', () => {
  let app: INestApplication;
  let httpServer: App;

  const eventType = 'e2e-test__distribution-rule';
  let distributionRuleId: string;
  let defaultDistributionRule;

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
        DistributionRuleModule,
        DistributionEventModule,
        SubscriptionModule,
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
          text: 'Tomb Raider was first released in 1996 by Core Design and published by Eidos Interactive. It was later transferred to Crystal Dynamics.',
        },
      ],
    };
    setActiveEntityData.mockReturnValue({
      sub: randomUUID(),
      authorization_details: ['distribution_event=create,remove'],
    });

    const { body } = await request(httpServer)
      .post('/distribution-event')
      .set(process.env.API_KEY_HEADER, process.env.API_KEY)
      .send(createDistributionEventDto);

    defaultDistributionRule = body.data.rules.find(
      (rule) => rule.metadata === null,
    );
  });

  beforeEach(() => {
    setActiveEntityData.mockReturnValue({
      sub: randomUUID(),
      authorization_details: [
        'distribution_event=create,remove',
        'distribution_rule=create,update,remove',
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

  describe('Create Distribution Rule [POST /]', () => {
    it('should respond with a CREATED status if the resource was created', () => {
      // Arrange.
      const createDistributionRuleDto: CreateDistributionRuleDto = {
        eventType: eventType,
        metadata: JSON.stringify({
          videoGame: "Tony Hawk's Pro Skater",
        }),
        deliveryMethods: [DeliveryMethods.CALL],
        text: "THPS's iconic soundtrack included bands such as  Goldfinger, Dead Kennedys, and Primus.",
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-rule')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionRuleDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          distributionRuleId = body.data.id;
        });
    });

    it('should respond with a BAD_REQUEST status if the payload is invalid', () => {
      // Arrange.
      const createDistributionRuleDto = {
        metadata: JSON.stringify({
          videoGame: 'Lego Star Wars',
        }),
        deliveryMethods: [DeliveryMethods.CALL, DeliveryMethods.SMS],
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-rule')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionRuleDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const createDistributionRuleDto: CreateDistributionRuleDto = {
        eventType: eventType,
        metadata: JSON.stringify({
          videoGame: 'Jak and Daxter',
        }),
        deliveryMethods: [DeliveryMethods.CALL, DeliveryMethods.SMS],
        text: 'Jak and Daxter is a platforming video game series originally developed by Naughty Dog and released in 2001.',
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-rule')
        .send(createDistributionRuleDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a NOT_FOUND status if the distribution event does not exist', () => {
      // Arrange.
      const createDistributionRuleDto: CreateDistributionRuleDto = {
        eventType: `${eventType}-2`,
        metadata: JSON.stringify({
          videoGame: "Tony Hawk's Pro Skater",
        }),
        deliveryMethods: [DeliveryMethods.CALL, DeliveryMethods.SMS],
        text: 'The underground world of Hallownest, a dark and mysterious kingdom inhabited by insects and other creatures, is from what game?',
      };

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-rule')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionRuleDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const createDistributionRuleDto: CreateDistributionRuleDto = {
        eventType: eventType,
        metadata: JSON.stringify({
          videoGame: 'Duck Hunt',
        }),
        deliveryMethods: [DeliveryMethods.CALL, DeliveryMethods.SMS],
        text: 'Duck Hunt released in 1984 for the Nintendo Entertainment System (NES).',
      };
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['distribution_rule=update,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .post('/distribution-rule')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(createDistributionRuleDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Distribution Rules [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-rule')
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource(s) were not found', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-rule')
        .query({ eventType: `${eventType}-2` })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Distribution Rule [GET /:id]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/distribution-rule/${distributionRuleId}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-rule/d6518492-1476-4332-bb1e-884bd5e099e4')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Update Distribution Rule [PATCH /:id]', () => {
    it('should respond with an OK status if the resource was updated', () => {
      // Arrange.
      const updateDistributionRuleDto: UpdateDistributionRuleDto = {
        bypassSubscriptions: true,
        emailTemplate:
          'The music in the "Ori" series is composed by Gareth Coker.',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-rule/${distributionRuleId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionRuleDto)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST if the payload is invalid', () => {
      // Arrange.
      const updateDistributionRuleDto: UpdateDistributionRuleDto = {
        metadata: JSON.stringify({
          videoGame: 'LEGO Star Wars: The Video Game',
        }),
        emailTemplate:
          'LEGO Star Wars: The Video Game was released in 2005 on the GameCube, GBA, Xbox, Playstation 2, Windows, & macOS',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-rule/${defaultDistributionRule.id}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionRuleDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Arrange.
      const updateDistributionRuleDto: UpdateDistributionRuleDto = {
        bypassSubscriptions: true,
        emailTemplate:
          'Final Fantasy was originally published in 1987 by Square',
      };

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-rule/${distributionRuleId}`)
        .send(updateDistributionRuleDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      const updateDistributionRuleDto: UpdateDistributionRuleDto = {
        bypassSubscriptions: true,
        emailTemplate:
          'Call of Duty has been played for nearly 25 billion hours.',
      };
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['distribution_rule=create,remove'],
      });

      // Act/Assert.
      return request(httpServer)
        .patch(`/distribution-rule/${distributionRuleId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionRuleDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Arrange.
      const updateDistributionRuleDto: UpdateDistributionRuleDto = {
        checkDeliveryWindow: true,
        emailTemplate:
          "The name of Final Fantasy first came about because it was Square's last attempt at the gaming industry",
      };

      // Act/Assert.
      return request(httpServer)
        .patch('/distribution-rule/d6518492-1476-4332-bb1e-884bd5e099e4')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .send(updateDistributionRuleDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Remove Distribution Rule [DELETE /:id]', () => {
    it('should respond with an OK status if the resource was deleted', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-rule/${distributionRuleId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.OK);
    });

    it('should respond with a BAD_REQUEST if the resource is the default distribution rule for an event', () => {
      // Arrange.
      const expectedResponse = {
        statusCode: 400,
        message: `Distribution rule id=${defaultDistributionRule.id} is the default distribution rule and cannot be deleted!`,
        error: 'Bad Request',
      };

      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-rule/${defaultDistributionRule.id}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(expectedResponse);
    });

    it('should respond with a UNAUTHORIZED status if the request is not authorized', () => {
      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-rule/${distributionRuleId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with a FORBIDDEN status if the requester does not have sufficient permissions', () => {
      // Arrange.
      setActiveEntityData.mockReturnValue({
        sub: randomUUID(),
        authorization_details: ['distribution_rule=create,update'],
      });

      // Act/Assert.
      return request(httpServer)
        .delete(`/distribution-rule/${distributionRuleId}`)
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .delete('/distribution-rule/d6518492-1476-4332-bb1e-884bd5e099e4')
        .set(process.env.API_KEY_HEADER, process.env.API_KEY)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
