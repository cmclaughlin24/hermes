import { RabbitMQHealthIndicator, RedisHealthIndicator } from '@hermes/health';
import { ConfigService } from '@nestjs/config';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { createConfigServiceMock } from '../../../test/helpers/provider.helper';
import { HealthController } from './health.controller';

export type MockHealthCheckService = Partial<
  Record<keyof HealthCheckService, jest.Mock>
>;

export const createHealthCheckServiceMock = (): MockHealthCheckService => ({
  check: jest.fn(),
});

export type MockTypeOrmHealthIndicator = Partial<
  Record<keyof TypeOrmHealthIndicator, jest.Mock>
>;

export const createTypeOrmHealthIndicatorMock =
  (): MockTypeOrmHealthIndicator => ({
    pingCheck: jest.fn(),
  });

export type MockRabbitMQHealthIndicator = Partial<
  Record<keyof RabbitMQHealthIndicator, jest.Mock>
>;

export const createRabbitMQHealthIndicatorMock =
  (): MockRabbitMQHealthIndicator => ({
    pingCheck: jest.fn(),
  });

export type MockRedisHealthIndicator = Partial<
  Record<keyof RedisHealthIndicator, jest.Mock>
>;

export const createRedisHealthIndicatorMock = (): MockRedisHealthIndicator => ({
  pingCheck: jest.fn(),
});

describe('HealthController', () => {
  let controller: HealthController;
  let health: MockHealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
        {
          provide: HealthCheckService,
          useValue: createHealthCheckServiceMock(),
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: createTypeOrmHealthIndicatorMock(),
        },
        {
          provide: RabbitMQHealthIndicator,
          useValue: createRabbitMQHealthIndicatorMock(),
        },
        {
          provide: RedisHealthIndicator,
          useValue: createRedisHealthIndicatorMock(),
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get<MockHealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check()', () => {
    it('should yield the result of the health indicators (success)', async () => {
      // Arrange.
      const expectedResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          rabbitmq: { status: 'up' },
          redis: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          rabbitmq: { status: 'up' },
          redis: { status: 'up' },
        },
      };
      health.check.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.check()).resolves.toEqual(expectedResult);
    });

    it('should yield the result of the health indicators (failure)', async () => {
      // Arrange.
      const expectedResult = {
        status: 'down',
        info: {
          database: { status: 'up' },
          rabbitmq: { status: 'up' },
        },
        error: {
          redis: {
            status: 'down',
            message: 'Could not connect',
          },
        },
        details: {
          database: { status: 'up' },
          rabbitmq: { status: 'up' },
        },
      };
      health.check.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(controller.check()).rejects.toEqual(expectedResult);
    });
  });
});
