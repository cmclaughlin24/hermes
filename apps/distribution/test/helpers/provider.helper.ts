import { TokenService } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { DistributionEventService } from '../../src/resources/distribution-event/distribution-event.service';
import { DistributionLogService } from '../../src/resources/distribution-log/distribution-log.service';
import { DistributionRuleService } from '../../src/resources/distribution-rule/distribution-rule.service';
import { SubscriptionService } from '../../src/resources/subscription/subscription.service';

export type MockConfigService = Partial<Record<keyof ConfigService, jest.Mock>>;

export const createConfigServiceMock = (): MockConfigService => ({
  get: jest.fn(),
});

export type MockDistributionEventService = Partial<
  Record<keyof DistributionEventService, jest.Mock>
>;

export const createDistributionEventServiceMock = (): MockDistributionEventService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockDistributionLogService = Partial<
  Record<keyof DistributionLogService, jest.Mock>
>;

export const createDistributionLogServiceMock = (): MockDistributionLogService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  log: jest.fn(),
});

export type MockDistributionRuleService = Partial<
  Record<keyof DistributionRuleService, jest.Mock>
>;

export const createDistributionRuleServiceMock = (): MockDistributionRuleService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockSubscriptionService = Partial<
  Record<keyof SubscriptionService, jest.Mock>
>;

export const createSubscriptionServiceMock = (): MockSubscriptionService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  removeAll: jest.fn(),
  remove: jest.fn(),
});

/**
 * Yields a tuple containing a mock `TokenService` and a mock function
 * for setting the returned `ActiveEntityData`.
 * @returns {[TokenService, jest.Mock]}
 */
export const createTokenServiceMock = (): [TokenService, jest.Mock] => {
  const setActiveEntityData = jest.fn();

  const tokenService = {
    verifyAccessToken: async function (token: string) {
      if (token === process.env.ACCESS_TOKEN) {
        return setActiveEntityData();
      }
      return null;
    },
    verifyApiKey: async function (apiKey: string) {
      if (apiKey === process.env.API_KEY) {
        return setActiveEntityData();
      }
      return null;
    },
  };

  return [tokenService, setActiveEntityData];
};
