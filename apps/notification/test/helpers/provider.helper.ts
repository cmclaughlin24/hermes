import { TokenService } from '@hermes/iam';
import { CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../src/common/services/email/email.service';
import { PhoneService } from '../../src/common/services/phone/phone.service';
import { PushNotificationService } from '../../src/common/services/push-notification/push-notification.service';
import { EmailTemplateService } from '../../src/resources/email-template/email-template.service';
import { NotificationLogService } from '../../src/resources/notification-log/notification-log.service';
import { PhoneTemplateService } from '../../src/resources/phone-template/phone-template.service';
import { PushTemplateService } from '../../src/resources/push-template/push-template.service';

export type MockCacheStore = Partial<Record<keyof CacheStore, jest.Mock>>;

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

export type MockEmailService = Partial<Record<keyof EmailService, jest.Mock>>;

export const createEmailServiceMock = (): MockEmailService => ({
  sendEmail: jest.fn(),
  createEmailTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockPhoneService = Partial<Record<keyof PhoneService, jest.Mock>>;

export const createPhoneServiceMock = (): MockPhoneService => ({
  sendText: jest.fn(),
  sendCall: jest.fn(),
  createNotificationDto: jest.fn(),
  createPhoneTemplate: jest.fn(),
});

export type MockPushNotificationService = Partial<
  Record<keyof PushNotificationService, jest.Mock>
>;

export const createPushNotificationServiceMock =
  (): MockPushNotificationService => ({
    sendPushNotification: jest.fn(),
    createPushNotificationTemplate: jest.fn(),
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
