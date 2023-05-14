import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

export type MockNotificationService = Partial<
  Record<keyof NotificationService, jest.Mock>
>;

export const createNotificationServiceMock = (): MockNotificationService => ({
  createEmailNotification: jest.fn(),
  createTextNotification: jest.fn(),
  createCallNotification: jest.fn(),
});

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: MockNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: createNotificationServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<MockNotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent email with subject ${createEmailNotificationDto.subject} to ${createEmailNotificationDto.to}`,
        {},
      );
      service.createEmailNotification.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.createEmailNotification(createEmailNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createTextNotification()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent SMS with body ${createPhoneNotificationDto.body} to ${createPhoneNotificationDto.to}`,
        {},
      );
      service.createTextNotification.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.createTextNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createCallNotification()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully made call with to ${createPhoneNotificationDto.to}`,
        {},
      );
      service.createCallNotification.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.createCallNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });
});
