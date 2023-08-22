import { ApiResponseDto } from '@hermes/common';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

export type MockNotificationService = Partial<
  Record<keyof NotificationService, jest.Mock>
>;

export const createNotificationServiceMock = (): MockNotificationService => ({
  createEmailNotification: jest.fn(),
  createTextNotification: jest.fn(),
  createCallNotification: jest.fn(),
  createPushNotification: jest.fn(),
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
      service.createEmailNotification.mockResolvedValue(expectedResult.data);

      // Act/Assert.
      await expect(
        controller.createEmailNotification(createEmailNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "HttpException" if an error occurred', async () => {
      // Arrange.
      service.createEmailNotification.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        controller.createEmailNotification(createEmailNotificationDto),
      ).rejects.toBeInstanceOf(HttpException);
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
      service.createTextNotification.mockResolvedValue(expectedResult.data);

      // Act/Assert.
      await expect(
        controller.createTextNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "HttpException" if an error occurred', async () => {
      // Arrange.
      service.createTextNotification.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        controller.createTextNotification(createPhoneNotificationDto),
      ).rejects.toBeInstanceOf(HttpException);
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
      service.createCallNotification.mockResolvedValue(expectedResult.data);

      // Act/Assert.
      await expect(
        controller.createCallNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "HttpException" if an error occurred', async () => {
      // Arrange.
      service.createCallNotification.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        controller.createCallNotification(createPhoneNotificationDto),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('createPushNotification()', () => {
    const createPushNotificationDto: CreatePushNotificationDto = {
      subscription: {},
      notification: { title: 'Unit Test' },
    } as CreatePushNotificationDto;

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully sent push notification`,
        {},
      );
      service.createPushNotification.mockResolvedValue(expectedResult.data);

      // Act/Assert.
      await expect(
        controller.createPushNotification(createPushNotificationDto),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "HttpException" if an error occurred', async () => {
      // Arrange.
      service.createPushNotification.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(
        controller.createPushNotification(createPushNotificationDto),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });
});
