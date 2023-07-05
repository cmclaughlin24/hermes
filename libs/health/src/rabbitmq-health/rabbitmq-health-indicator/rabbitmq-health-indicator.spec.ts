jest.mock('amqplib');

import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import * as amqplib from 'amqplib';
import {
  RabbitMQHealthIndicator,
  RabbitMQHealthIndicatorOptions,
} from './rabbitmq-health-indicator';

describe('RabbitmqHealthIndicator', () => {
  let indicator: RabbitMQHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitMQHealthIndicator],
    }).compile();

    indicator = module.get<RabbitMQHealthIndicator>(RabbitMQHealthIndicator);
  });
  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('pingCheck()', () => {
    const key = 'rabbitmq';
    const options: RabbitMQHealthIndicatorOptions = {
      uri: 'unit-test',
    };

    it('should yield a "HealthIndicatorResult" if the health check was successful', async () => {
      // Arrange.
      const expectedResult: HealthIndicatorResult = {
        rabbitmq: {
          status: 'up',
          error: undefined,
        },
      };
      amqplib.connect.mockResolvedValue({ close: jest.fn() });

      // Act/Assert.
      await expect(indicator.pingCheck(key, options)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "HealthCheckError" if the health check failed', async () => {
      // Arrange.
      const error = new Error('Something went wrong!');
      const indicatorResult: HealthIndicatorResult = {
        rabbitmq: {
          status: 'down',
          error: error.message,
        },
      };
      const expectedResult = new HealthCheckError(
        'RabbitMQ Error',
        indicatorResult,
      );
      amqplib.connect.mockRejectedValue(error);

      // Act/Assert.
      await expect(indicator.pingCheck(key, options)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
