import { Test, TestingModule } from '@nestjs/testing';
import { CallInstance } from 'twilio/lib/rest/api/v2010/account/call';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import {
    MockEmailService,
    MockPhoneService,
    MockPushNotificationService,
    createEmailServiceMock,
    createPhoneServiceMock,
    createPushNotificationServiceMock,
} from '../../../test/helpers/provider.helper';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { EmailService } from '../../common/services/email/email.service';
import { PhoneService } from '../../common/services/phone/phone.service';
import { PushNotificationService } from '../../common/services/push-notification/push-notification.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let emailService: MockEmailService;
  let phoneService: MockPhoneService;
  let pushNotificationService: MockPushNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EmailService,
          useValue: createEmailServiceMock(),
        },
        {
          provide: PhoneService,
          useValue: createPhoneServiceMock(),
        },
        {
          provide: PushNotificationService,
          useValue: createPushNotificationServiceMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailService = module.get<MockEmailService>(EmailService);
    phoneService = module.get<MockPhoneService>(PhoneService);
    pushNotificationService = module.get<MockPushNotificationService>(
      PushNotificationService,
    );
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
      emailService.createEmailTemplate.mockResolvedValue(
        createEmailNotificationDto,
      );
    });

    afterEach(() => {
      emailService.sendEmail.mockClear();
      emailService.createEmailTemplate.mockClear();
    });

    it('should send an email notification', async () => {
      // Act.
      await service.createEmailNotification(createEmailNotificationDto);

      // Assert.
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        createEmailNotificationDto,
      );
    });

    it('should yield a "SentMessageInfo" object', async () => {
      // Arrange.
      const expectedResult = {};
      emailService.sendEmail.mockResolvedValue(expectedResult);

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
      phoneService.createPhoneTemplate.mockResolvedValue(
        createPhoneNotificationDto,
      );
    });

    afterEach(() => {
      phoneService.createPhoneTemplate.mockClear();
      phoneService.sendText.mockClear();
    });

    it('should send a text notification', async () => {
      // Act.
      await service.createTextNotification(createPhoneNotificationDto);

      // Assert.
      expect(phoneService.sendText).toHaveBeenCalledWith(
        createPhoneNotificationDto,
      );
    });

    it('should yield a "MessageInstance" object', async () => {
      // Arrange.
      const expectedResult = {} as MessageInstance;
      phoneService.sendText.mockResolvedValue(expectedResult);

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
      phoneService.createPhoneTemplate.mockResolvedValue(
        createPhoneNotificationDto,
      );
    });

    afterEach(() => {
      phoneService.createPhoneTemplate.mockClear();
      phoneService.sendCall.mockClear();
    });

    it('should send a call notification', async () => {
      // Act.
      await service.createCallNotification(createPhoneNotificationDto);

      // Assert.
      expect(phoneService.sendCall).toHaveBeenCalledWith(
        createPhoneNotificationDto,
      );
    });

    it('should yield a "CallInstance" object', async () => {
      // Arrange.
      const expectedResult = {} as CallInstance;
      phoneService.sendCall.mockResolvedValue(expectedResult);

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
      pushNotificationService.createPushNotificationTemplate.mockResolvedValue(
        createPushNotificationDto,
      );
    });

    afterEach(() => {
      pushNotificationService.createPushNotificationTemplate.mockClear();
      pushNotificationService.sendPushNotification.mockClear();
    });

    it('should send a push notification', async () => {
      // Act.
      await service.createPushNotification(createPushNotificationDto);

      // Assert.
      expect(pushNotificationService.sendPushNotification).toHaveBeenCalledWith(
        createPushNotificationDto,
      );
    });

    it('should yield an object', async () => {
      // Arrange.
      const expectedResult = {};
      pushNotificationService.sendPushNotification.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.createPushNotification(createPushNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });
});
