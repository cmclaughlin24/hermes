import { RedisHealthIndicator } from '@hermes/health';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
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
          provide: HealthCheckService,
          useValue: createHealthCheckServiceMock(),
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: createTypeOrmHealthIndicatorMock(),
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
          redis: { status: 'up' },
          twilio: { status: 'up' },
          'send-grid': { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up' },
          twilio: { status: 'up' },
          'send-grid': { status: 'up' },
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
        },
        error: {
          redis: {
            status: 'down',
            message: 'Could not connect',
          },
        },
        details: {
          database: { status: 'up' },
        },
      };
      health.check.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(controller.check()).rejects.toEqual(expectedResult);
    });
  });
});
