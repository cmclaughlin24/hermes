import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_OPTIONS_TOKEN } from '../redis-health.module-definition';
import { RedisHealthIndicator } from './redis-health-indicator';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  const connection = {
    ping: jest.fn(),
    quit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: REDIS_OPTIONS_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  beforeEach(() => {
    // @ts-ignore
    indicator.connection = connection;
  })

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('pingCheck()', () => {
    const key = 'redis';

    beforeEach(() => {
      // @ts-ignore
      indicator.connection = connection;
    });

    afterEach(() => {
      connection.ping.mockClear();
    });

    it('should yield a "HealthIndicatorResult" if the health check was successful', async () => {
      // Arrange.
      const expectedResult: HealthIndicatorResult = {
        redis: {
          status: 'up',
          error: undefined,
        },
      };

      // Act/Assert.
      await expect(indicator.pingCheck(key)).resolves.toEqual(expectedResult);
    });

    it('should yield a "HealthCheckError" if the health check failed (connection null/undefined)', async () => {
      // Arrange.
      const error = new Error('A Redis connection does not exist');
      const indicatorResult: HealthIndicatorResult = {
        redis: {
          status: 'down',
          error: error.message,
        },
      };
      const expectedResult = new HealthCheckError(
        'Redis Error',
        indicatorResult,
      );
      // @ts-ignore
      indicator.connection = null;

      // Act/Assert.
      await expect(indicator.pingCheck(key)).rejects.toEqual(expectedResult);
    });

    it('should yield a "HealthCheckError" if the health check failed (connection response)', async () => {
      // Arrange.
      const error = new Error('Something went wrong!');
      const indicatorResult: HealthIndicatorResult = {
        redis: {
          status: 'down',
          error: error.message,
        },
      };
      const expectedResult = new HealthCheckError(
        'Redis Error',
        indicatorResult,
      );
      connection.ping.mockRejectedValue(error);

      // Act/Assert.
      await expect(indicator.pingCheck(key)).rejects.toEqual(expectedResult);
    });
  });

  describe('onApplicationShutdown()', () => {
    afterEach(() => {
      connection.quit.mockClear();
    });

    it('should disconnect from the redis server or cluster if it is defined', async () => {
      // Arrange.
      // @ts-ignore
      indicator.connection = connection;
      
      // Act.
      await indicator.onApplicationShutdown();

      // Assert.
      expect(connection.quit).toHaveBeenCalled();
    });

    it('should not disconnect from the redis server or cluster if it is null/undefined', async () => {
      // Arrange.
      // @ts-ignore
      indicator.connection = null;

      // Act.
      await indicator.onApplicationShutdown();

      // Assert.
      expect(connection.quit).not.toHaveBeenCalled();
    });
  });
});
