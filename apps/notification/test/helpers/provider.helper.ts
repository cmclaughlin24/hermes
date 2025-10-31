import { TokenService } from '@hermes/iam';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { EmailTemplateService } from '../../src/email-template/email-template.service';
import { NotificationLogService } from '../../src/notification-log/notification-log.service';
import { PhoneTemplateService } from '../../src/phone-template/phone-template.service';
import { PushTemplateService } from '../../src/push-template/push-template.service';
import { EmailNotifierStrategy } from 'apps/notification/src/notification/strategies/email-notifier.strategy';
import { CallNotifierStrategy } from 'apps/notification/src/notification/strategies/call-notifier.strategy';
import { PushNotifierStrategy } from 'apps/notification/src/notification/strategies/push-notifier.strategy';
import { SmsNotifierStrategy } from 'apps/notification/src/notification/strategies/sms-notifier.strategy';

export type MockCacheStore = Partial<Record<keyof Cache, jest.Mock>>;

export const createCacheStoreMock = (): MockCacheStore => ({
  get: jest.fn(),
  set: jest.fn(async () => {}),
  del: jest.fn(),
});

export type MockConfigService = Partial<Record<keyof ConfigService, jest.Mock>>;

export const createConfigServiceMock = (): MockConfigService => ({
  get: jest.fn(),
});

export type MockEmailTemplateService = Partial<
  Record<keyof EmailTemplateService, jest.Mock>
>;

export const createEmailTemplateServiceMock = (): MockEmailTemplateService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockPhoneTemplateService = Partial<
  Record<keyof PhoneTemplateService, jest.Mock>
>;

export const createPhoneTemplateServiceMock = (): MockPhoneTemplateService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockPushTemplateService = Partial<
  Record<keyof PushTemplateService, jest.Mock>
>;

export const createPushTemplateServiceMock = (): MockPushTemplateService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export type MockEmailNotifierStrategy = Partial<
  Record<keyof EmailNotifierStrategy, jest.Mock>
>;

export const createEmailNotifierStrategyMock =
  (): MockEmailNotifierStrategy => ({
    notify: jest.fn(),
    createTemplate: jest.fn(),
    createNotificationDto: jest.fn(),
  });

export type MockCallStrategy = Partial<
  Record<keyof CallNotifierStrategy, jest.Mock>
>;

export const createCallNotifierStrategyMock = (): MockCallStrategy => ({
  notify: jest.fn(),
  createTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockSmsNotifierStrategy = Partial<
  Record<keyof SmsNotifierStrategy, jest.Mock>
>;

export const createSmsNotifierStrategyMock = (): MockSmsNotifierStrategy => ({
  notify: jest.fn(),
  createTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockPushNotifierStrategy = Partial<
  Record<keyof PushNotifierStrategy, jest.Mock>
>;

export const createPushNotifierStrategyMock = (): MockPushNotifierStrategy => ({
  notify: jest.fn(),
  createTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockNotificationLogService = Partial<
  Record<keyof NotificationLogService, jest.Mock>
>;

export const createNotificationLogServiceMock =
  (): MockNotificationLogService => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    log: jest.fn(),
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
