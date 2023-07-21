import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DistributionJob } from '../src/common/types/distribution-job.type';
import { MessageState } from '../src/common/types/message-state.type';
import { DistributionLogModule } from '../src/resources/distribution-log/distribution-log.module';
import { DistributionLogService } from '../src/resources/distribution-log/distribution-log.service';

describe('[Feature] Distribution Log', () => {
  let app: INestApplication;
  let httpServer: HttpServer;
  let distributionLogService: DistributionLogService;

  const queueName = 'e2e-test';
  const eventType = 'e2e-test__distribution-log';
  let log;

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
        DistributionLogModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    distributionLogService = moduleFixture.get<DistributionLogService>(
      DistributionLogService,
    );
  });

  beforeAll(async () => {
    // Note: Create several distribution log entries for E2E test cases.
    const distributionJob1: DistributionJob = {
      id: 'f1b98d1a-3ba0-4974-9e74-ac69bbe9b553',
      queue: queueName,
      type: eventType,
      attemptsMade: 1,
      metadata: null,
      payload: null,
      addedAt: new Date(),
      processedAt: new Date(),
      finishedAt: null,
    };
    const distributionJob2: DistributionJob = {
      id: '45eb2701-ef08-4032-8c91-abf96aec222a',
      queue: queueName,
      type: eventType,
      attemptsMade: 2,
      metadata: null,
      payload: null,
      addedAt: new Date(),
      processedAt: new Date(),
      finishedAt: new Date(),
    };

    log = await distributionLogService.log(
      distributionJob1,
      MessageState.ACTIVE,
    );
    await distributionLogService.log(distributionJob2, MessageState.COMPLETED);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Get Distribution Logs [GET /]', () => {
    it('should respond with an OK status if resource(s) were found', () => {
      // Act/Assert.
      return request(httpServer).get('/distribution-log').expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if resource(s) were not found', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-log')
        .query({ eventType: 'grand-theft-auto-iii' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Distribution Log [GET /:id]', () => {
    it('should respond with an OK status if the resource exists', () => {
      // Act/Assert.
      return request(httpServer)
        .get(`/distribution-log/${log.id}`)
        .expect(HttpStatus.OK);
    });

    it('should respond with a NOT_FOUND status if the resource does not exist', () => {
      // Act/Assert.
      return request(httpServer)
        .get('/distribution-log/86121803-f171-4271-85c2-4ac58d8f722f')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
