import { RedisHealthIndicator, TwilioHealthIndicator } from '@hermes/health';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { createConfigServiceMock } from '../../../test/helpers/provider.helper';
import { HealthController } from './health.controller';

export type MockHealthCheckService = Partial<
  Record<keyof HealthCheckService, jest.Mock>
>;

export const createHealthCheckServiceMock = (): MockHealthCheckService => ({
  check: jest.fn(),
});

export type MockHttpHealthIndicator = Partial<
  Record<keyof HttpHealthIndicator, jest.Mock>
>;

export const createHttpHealthIndicatorMock = (): MockHttpHealthIndicator => ({
  pingCheck: jest.fn(),
});

export type MockSequelizeHealthIndicator = Partial<
  Record<keyof SequelizeHealthIndicator, jest.Mock>
>;

export const createSequelizeHealthIndicatorMock =
  (): MockSequelizeHealthIndicator => ({
    pingCheck: jest.fn(),
  });

export type MockRedisHealthIndicator = Partial<
  Record<keyof RedisHealthIndicator, jest.Mock>
>;

export const createRedisHealthIndicatorMock = (): MockRedisHealthIndicator => ({
  pingCheck: jest.fn(),
});

export type MockTwilioHealthIndicator = Partial<
  Record<keyof TwilioHealthIndicator, jest.Mock>
>;

export const createTwilioHealthIndicatorMock =
  (): MockTwilioHealthIndicator => ({
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
          provide: HttpHealthIndicator,
          useValue: createHttpHealthIndicatorMock(),
        },
        {
          provide: SequelizeHealthIndicator,
          useValue: createSequelizeHealthIndicatorMock(),
        },
        {
          provide: RedisHealthIndicator,
          useValue: createRedisHealthIndicatorMock(),
        },
        {
          provide: TwilioHealthIndicator,
          useValue: createTwilioHealthIndicatorMock(),
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
        status: 'ok',
        info: {
          database: { status: 'up' },
          twilio: { status: 'up' },
          'send-grid': { status: 'up' },
        },
        error: {
          redis: {
            status: 'down',
            message: 'Could not connect',
          },
        },
        details: {
          database: { status: 'up' },
          twilio: { status: 'up' },
          'send-grid': { status: 'up' },
        },
      };
      health.check.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(controller.check()).rejects.toEqual(expectedResult);
    });
  });
});
