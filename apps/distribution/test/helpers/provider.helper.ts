import { SubscriptionService } from '../../src/resources/subscription/subscription.service';

export type MockDistributionRuleService = Partial<
  Record<keyof SubscriptionService, jest.Mock>
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
  remove: jest.fn(),
});
