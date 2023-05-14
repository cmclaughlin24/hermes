import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseDto, DeliveryMethods } from '@notification/common';
import { Job, JobState } from 'bullmq';
import {
  MockQueue,
  createQueueMock,
} from '../../../../notification/test/helpers/queue.helper';
import { CreateEmailNotificationDto } from '../../common/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../common/dto/create-phone-notification.dto';
import { NotificationJobService } from './notification-job.service';

describe('NotificationJobService', () => {
  let service: NotificationJobService;
  let queue: MockQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationJobService,
        {
          provide: getQueueToken(process.env.BULLMQ_NOTIFICATION_QUEUE),
          useValue: createQueueMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationJobService>(NotificationJobService);
    queue = module.get<MockQueue>(
      getQueueToken(process.env.BULLMQ_NOTIFICATION_QUEUE),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne()', () => {
    afterEach(() => {
      queue.getJobs.mockClear();
    });

    it('should yield a list of jobs from the notification queue', async () => {
      // Arrange.
      const expectedResult = [{} as Job, {} as Job];
      queue.getJobs.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll([])).resolves.toEqual(expectedResult);
    });

    it('should yield a list of jobs filtered by state from the notification queue', async () => {
      // Arrange.
      const expectedResult: JobState[] = ['completed', 'failed'];
      queue.getJobs.mockResolvedValue(expectedResult);

      // Act.
      await service.findAll(expectedResult);

      // Assert.
      expect(queue.getJobs).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw a "NotFoundException" if queue returns null/undefined', async () => {
      // Arrange.
      const states = [];
      const expectedResult = new NotFoundException(
        `Jobs with state(s) ${states.join(', ')} not found`,
      );
      queue.getJobs.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll(states)).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if queue returns an empty list', async () => {
      // Arrange.
      const states = [];
      const expectedResult = new NotFoundException(
        `Jobs with state(s) ${states.join(', ')} not found`,
      );
      queue.getJobs.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll(states)).rejects.toEqual(expectedResult);
    });
  });

  describe('findAll()', () => {
    afterEach(() => {
      queue.getJob.mockClear();
    });

    it('should yield a job from the notification queue', async () => {
      // Arrange.
      const expectedResult = {};
      queue.getJob.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findOne('0')).resolves.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the queue returns null/undefined', async () => {
      // Arrange.
      const id = '0';
      const expectedResult = new NotFoundException(
        `Job with ${id} not found in '${queue.name}' queue`,
      );
      queue.getJob.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(id)).rejects.toEqual(expectedResult);
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
      queue.add.mockClear();
    });

    it('should add an "email" job to the notification queue', async () => {
      // Act.
      await service.createEmailNotification(createEmailNotificationDto);

      // Assert.
      expect(queue.add).toHaveBeenCalledWith(
        DeliveryMethods.EMAIL,
        createEmailNotificationDto,
      );
    });

    it('should yield an "ApiResposneDto" object with the job', async () => {
      // Arrange.
      const job = {};
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled email notification`,
        job,
      );
      queue.add.mockResolvedValue(job);

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

    afterEach(() => {
      queue.add.mockClear();
    });

    it('should add a "sms" job to the notification queue', async () => {
      // Act.
      await service.createTextNotification(createPhoneNotificationDto);

      // Assert.
      expect(queue.add).toHaveBeenCalledWith(
        DeliveryMethods.SMS,
        createPhoneNotificationDto,
      );
    });

    it('should yield an "ApiResposneDto" object with the job', async () => {
      // Arrange.
      const job = {};
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled sms notification`,
        job,
      );
      queue.add.mockResolvedValue(job);

      // Act/Assert.
      await expect(
        service.createTextNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });

  describe('createCallNotfication()', () => {
    const createPhoneNotificationDto: CreatePhoneNotificationDto = {
      to: '+19999999999',
      from: '+11111111111',
      body: 'Unit Testing',
    };

    afterEach(() => {
      queue.add.mockClear();
    });

    it('should add a "call" job to the notification queue', async () => {
      // Act.
      await service.createCallNotification(createPhoneNotificationDto);

      // Assert.
      expect(queue.add).toHaveBeenCalledWith(
        DeliveryMethods.CALL,
        createPhoneNotificationDto,
      );
    });

    it('should yield an "ApiResposneDto" object with the job', async () => {
      // Arrange.
      const job = {};
      const expectedResult = new ApiResponseDto(
        `Successfully scheduled call notification`,
        job,
      );
      queue.add.mockResolvedValue(job);

      // Act/Assert.
      await expect(
        service.createCallNotification(createPhoneNotificationDto),
      ).resolves.toEqual(expectedResult);
    });
  });
});
