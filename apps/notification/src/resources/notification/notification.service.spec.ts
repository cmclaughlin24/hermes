import { ApiResponseDto } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockEmailService,
  MockPhoneService,
  createEmailServiceMock,
  createPhoneServiceMock,
} from '../../../../notification/test/helpers/provider.helpers';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { EmailService } from '../../common/providers/email/email.service';
import { PhoneService } from '../../common/providers/phone/phone.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let emailService: MockEmailService;
  let phoneService: MockPhoneService;

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
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailService = module.get<MockEmailService>(EmailService);
    phoneService = module.get<MockPhoneService>(PhoneService);
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

    it('should yield an "ApiResponseDto" object with the created notification', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent email with subject ${createEmailNotificationDto.subject} to ${createEmailNotificationDto.to}`,
        {},
      );
      emailService.sendEmail.mockResolvedValue({});

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

    it('should yield an "ApiResponseDto" object with the created notification', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent SMS with body ${createPhoneNotificationDto.body} to ${createPhoneNotificationDto.to}`,
        {},
      );
      phoneService.sendText.mockResolvedValue({});

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

    it('should yield an "ApiResponseDto" object with the created notification', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully made call with to ${createPhoneNotificationDto.to}`,
        {},
      );
      phoneService.sendCall.mockResolvedValue({});

      // Act/Assert.
      await expect(
        service.createCallNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });
});
