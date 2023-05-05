import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../notification/src/common/providers/email/email.service';
import { PhoneService } from '../../../notification/src/common/providers/phone/phone.service';
import { RadioService } from '../../../notification/src/common/providers/radio/radio.service';
import { EmailTemplateService } from '../../../notification/src/resources/email-template/email-template.service';
import { NotificationLogService } from '../../../notification/src/resources/notification-log/notification-log.service';

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

export type MockEmailService = Partial<Record<keyof EmailService, jest.Mock>>;

export const createEmailServiceMock = (): MockEmailService => ({
  sendEmail: jest.fn(),
  createEmailTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockPhoneService = Partial<Record<keyof PhoneService, jest.Mock>>;

export const createPhoneServiceMock = (): MockPhoneService => ({
  sendText: jest.fn(),
  createNotificationDto: jest.fn(),
});

export type MockRadioService = Partial<Record<keyof RadioService, jest.Mock>>;

export const createRadioServiceMock = (): MockRadioService => ({
  sendText: jest.fn(),
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
