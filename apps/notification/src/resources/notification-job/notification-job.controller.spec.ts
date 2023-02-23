import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto } from '@notification/common';
import { Job } from 'bull';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
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
    createRadioNotification: jest.fn(),
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
    it('should yield a list of jobs from the notification queue', async () => {
      // Arrange.
      const expectedResult = [{} as Job, {} as Job];
      service.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findAll([])).resolves.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should yield a job from the notification queue', async () => {
      // Arrange.
      const expectedResult = {} as Job;
      service.findOne.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(controller.findOne(0)).resolves.toEqual(expectedResult);
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

    it('should yieild an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled email notification`,
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
    
    it('should yieild an "ApiResponseDto" object', async () => {
      // Arrange.
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled sms notification`,
        {},
      );
      service.createTextNotification.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        controller.createTextNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createRadioNotification()', () => {
    it.todo('should yieild an "ApiResponseDto" object');
  });
});
