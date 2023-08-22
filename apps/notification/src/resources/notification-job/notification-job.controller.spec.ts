import { ApiResponseDto } from '@hermes/common';
import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { NotificationJobController } from './notification-job.controller';
import { NotificationJobService } from './notification-job.service';

export type MockNotificationJobService = Partial<
  Record<keyof NotificationJobService, jest.Mock>
>;

export const createNotificationJobServiceMock =
  (): MockNotificationJobService => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    createEmailNotification: jest.fn(),
    createTextNotification: jest.fn(),
    createCallNotification: jest.fn(),
    createPushNotification: jest.fn(),
  });

describe('NotificationJobController', () => {
  let controller: NotificationJobController;
  let service: MockNotificationJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationJobController],
      providers: [
        {
          provide: NotificationJobService,
          useValue: createNotificationJobServiceMock(),
        },
      ],
    }).compile();

    controller = module.get<NotificationJobController>(
      NotificationJobController,
    );
    service = module.get<MockNotificationJobService>(NotificationJobService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      service.findAll.mockClear();
    });

    it('should yield a list of jobs from the notification queue', async () => {
      // Arrange.
      const expectedResult = [{} as Job, {} as Job];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll([])).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Jobs with state(s) ${[].join(', ')} not found`,
      );
      service.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findAll([])).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Jobs with state(s) ${[].join(', ')} not found`,
      );
      service.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(controller.findAll([])).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      service.findOne.mockClear();
    });

    it('should yield a job from the notification queue', async () => {
      // Arrange.
      const expectedResult = {} as Job;
      service.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findOne('0')).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the service returns null/undefined', async () => {
      // Arrange.
      const id = '0';
      const expectedResult = new NotFoundException(`Job with ${id} not found!`);
      service.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(controller.findOne(id)).rejects.toEqual(expectedResult);
    });
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

    afterEach(() => {
      service.createEmailNotification.mockClear();
    });

    it('should yieild an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled email notification`,
        {},
      );
      service.createEmailNotification.mockResolvedValue({});

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

    afterEach(() => {
      service.createTextNotification.mockClear();
    });

    it('should yieild an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled sms notification`,
        {},
      );
      service.createTextNotification.mockResolvedValue({});

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

    afterEach(() => {
      service.createCallNotification.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled call notification`,
        {},
      );
      service.createCallNotification.mockResolvedValue({});

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

    afterEach(() => {
      service.createPushNotification.mockClear();
    });

    it('should yield an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled push-notification notification`,
        {},
      );
      service.createPushNotification.mockResolvedValue({});

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
