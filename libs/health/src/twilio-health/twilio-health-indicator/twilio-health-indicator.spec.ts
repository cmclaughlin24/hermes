import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TwilioHealthIndicator,
  TwilioHealthIndicatorOptions,
} from './twilio-health-indicator';

const accountMock = {
  fetch: jest.fn(),
};

const clientMock = {
  api: {
    v2010: {
      accounts: jest.fn(() => accountMock),
    },
  },
};

jest.mock('twilio', () => jest.fn(() => clientMock));

describe('TwilioHealthIndicator', () => {
  let indicator: TwilioHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwilioHealthIndicator],
    }).compile();

    indicator = module.get<TwilioHealthIndicator>(TwilioHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('pingCheck()', () => {
    const key = 'twilio';
    const options: TwilioHealthIndicatorOptions = {
      accountSid: 'Star Fox Command',
      authToken: 'Mario Kart DS',
    };

    it('should yield a "HealthIndicatorResult" if the health check was successful (account status=active)', async () => {
      // Arrange.
      const expectedResult: HealthIndicatorResult = {
        twilio: {
          status: 'up',
          error: undefined,
        },
      };
      accountMock.fetch.mockResolvedValue({ status: 'active' });

      // Act/Assert.
      await expect(indicator.pingCheck(key, options)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "HealthCheckError" if the health check failed (account status=closed)', async () => {
      // Arrange.
      const error = new Error('Something went wrong!');
      const indicatorResult: HealthIndicatorResult = {
        twilio: {
          status: 'down',
          error: error.message,
        },
      };
      const expectedResult = new HealthCheckError(
        'Twilio Error',
        indicatorResult,
      );
      accountMock.fetch.mockResolvedValue({ status: 'closed' });

      // Act/Assert.
      await expect(indicator.pingCheck(key, options)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "HealthCheckError" if the health check failed (account status=suspended)', async () => {
      // Arrange.
      const error = new Error('Something went wrong!');
      const indicatorResult: HealthIndicatorResult = {
        twilio: {
          status: 'down',
          error: error.message,
        },
      };
      const expectedResult = new HealthCheckError(
        'Twilio Error',
        indicatorResult,
      );
      accountMock.fetch.mockResolvedValue({ status: 'suspended' });

      // Act/Assert.
      await expect(indicator.pingCheck(key, options)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
