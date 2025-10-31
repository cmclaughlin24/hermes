import { Test, TestingModule } from '@nestjs/testing';
import { CallInstance } from 'twilio/lib/rest/api/v2010/account/call';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import {
  MockEmailNotifierStrategy,
  MockCallStrategy,
  MockPushNotifierStrategy,
  createEmailNotifierStrategyMock,
  createCallNotifierStrategyMock,
  createPushNotifierStrategyMock,
  createSmsNotifierStrategyMock,
  MockSmsNotifierStrategy,
} from '../../test/helpers/provider.helper';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from './dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { NotificationService } from './notification.service';
import { EmailNotifierStrategy } from './strategies/email-notifier.strategy';
import { CallNotifierStrategy } from './strategies/call-notifier.strategy';
import { PushNotifierStrategy } from './strategies/push-notifier.strategy';
import { SmsNotifierStrategy } from './strategies/sms-notifier.strategy';
import { NotifierStrategyService } from './notifier-strategy.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let emailStrategy: MockEmailNotifierStrategy;
  let callStrategy: MockCallStrategy;
  let smsStrategy: MockSmsNotifierStrategy;
  let pushStrategy: MockPushNotifierStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        NotifierStrategyService,
        {
          provide: EmailNotifierStrategy,
          useValue: createEmailNotifierStrategyMock(),
        },
        {
          provide: CallNotifierStrategy,
          useValue: createCallNotifierStrategyMock(),
        },
        {
          provide: SmsNotifierStrategy,
          useValue: createSmsNotifierStrategyMock(),
        },
        {
          provide: PushNotifierStrategy,
          useValue: createPushNotifierStrategyMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailStrategy = module.get<MockEmailNotifierStrategy>(EmailNotifierStrategy);
    callStrategy = module.get<MockCallStrategy>(CallNotifierStrategy);
    smsStrategy = module.get<MockSmsNotifierStrategy>(SmsNotifierStrategy);
    pushStrategy =
      module.get<MockPushNotifierStrategy>(PushNotifierStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmailNotification()', () => {
    const createEmailNotificationDto: CreateEmailNotificationDto = {
      to: 'john.doe@email.com',
      from: 'no-reply@email.com',
      subject: 'Unit Testing',
      html: '<h1>Unit Testing</h1>',
      text: 'Unit Testing',
      template: null,
      context: null,
    };

    beforeEach(() => {
      emailStrategy.createTemplate.mockResolvedValue(createEmailNotificationDto);
    });

    afterEach(() => {
      emailStrategy.notify.mockClear();
      emailStrategy.createTemplate.mockClear();
    });

    it('should send an email notification', async () => {
      // Act.
      await service.createEmailNotification(createEmailNotificationDto);

      // Assert.
      expect(emailStrategy.notify).toHaveBeenCalledWith(
        createEmailNotificationDto,
      );
    });

    it('should yield a "SentMessageInfo" object', async () => {
      // Arrange.
      const expectedResult = {};
      emailStrategy.notify.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.createEmailNotification(createEmailNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createTextNotification()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    beforeEach(() => {
      smsStrategy.createTemplate.mockResolvedValue(createPhoneNotificationDto);
    });

    afterEach(() => {
      smsStrategy.createTemplate.mockClear();
      smsStrategy.notify.mockClear();
    });

    it('should send a text notification', async () => {
      // Act.
      await service.createTextNotification(createPhoneNotificationDto);

      // Assert.
      expect(smsStrategy.notify).toHaveBeenCalledWith(
        createPhoneNotificationDto,
      );
    });

    it('should yield a "MessageInstance" object', async () => {
      // Arrange.
      const expectedResult = {} as MessageInstance;
      smsStrategy.notify.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.createTextNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createCalloNotification()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    beforeEach(() => {
      callStrategy.createTemplate.mockResolvedValue(
        createPhoneNotificationDto,
      );
    });

    afterEach(() => {
      callStrategy.createTemplate.mockClear();
      callStrategy.notify.mockClear();
    });

    it('should send a call notification', async () => {
      // Act.
      await service.createCallNotification(createPhoneNotificationDto);

      // Assert.
      expect(callStrategy.notify).toHaveBeenCalledWith(
        createPhoneNotificationDto,
      );
    });

    it('should yield a "CallInstance" object', async () => {
      // Arrange.
      const expectedResult = {} as CallInstance;
      callStrategy.notify.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.createCallNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createPushNotification()', () => {
    const createPushNotificationDto: CreatePushNotificationDto = {
      subscription: {},
      notification: { title: 'Unit Test' },
    } as CreatePushNotificationDto;

    beforeEach(() => {
      pushStrategy.createTemplate.mockResolvedValue(
        createPushNotificationDto,
      );
    });

    afterEach(() => {
      pushStrategy.createTemplate.mockClear();
      pushStrategy.notify.mockClear();
    });

    it('should send a push notification', async () => {
      // Act.
      await service.createPushNotification(createPushNotificationDto);

      // Assert.
      expect(pushStrategy.notify).toHaveBeenCalledWith(
        createPushNotificationDto,
      );
    });

    it('should yield an object', async () => {
      // Arrange.
      const expectedResult = {};
      pushStrategy.notify.mockResolvedValue(
        expectedResult,
      );

      // Act/Assert.
      await expect(
        service.createPushNotification(createPushNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });
});
