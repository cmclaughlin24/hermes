import { Test, TestingModule } from '@nestjs/testing';
import { Job, UnrecoverableError } from 'bullmq';
import {
  MockNotificationLogService,
  MockNotifierStrategyService,
  createNotificationLogServiceMock,
  createNotifierStrategyServiceMock,
} from '../../test/helpers/provider.helper';
import { NotificationConsumer } from './notification.consumer';
import { NotificationLogService } from '../notification-log/notification-log.service';
import { NotifierStrategyService } from './notifier-strategy.service';
import { NotifierStrategy } from './interfaces/notifier-strategy.interface';
import { NotificationDto } from './interfaces/notification-dto.interface';
import { beforeEach } from 'node:test';

const createNotifierStrategyMock = (): NotifierStrategy<NotificationDto> => ({
  createTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
  notify: jest.fn(),
});

describe('NotificationConsumer', () => {
  let consumser: NotificationConsumer;
  let strategyService: MockNotifierStrategyService;
  let notificationLogService: MockNotificationLogService;

  const job: any = { id: 1, data: {}, log: jest.fn(), updateData: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: NotifierStrategyService,
          useValue: createNotifierStrategyServiceMock(),
        },
        {
          provide: NotificationLogService,
          useValue: createNotificationLogServiceMock(),
        },
      ],
    }).compile();

    consumser = module.get<NotificationConsumer>(NotificationConsumer);
    notificationLogService = module.get<MockNotificationLogService>(
      NotificationLogService,
    );
    strategyService = module.get<MockNotifierStrategyService>(
      NotifierStrategyService,
    );
  });

  it('should be defined', () => {
    expect(consumser).toBeDefined();
  });

  describe('process()', () => {
    let strategy: NotifierStrategy<NotificationDto>;

    beforeEach(() => {
      strategy = createNotifierStrategyMock();
      strategyService.get.mockReturnValue(strategy);
    });

    afterEach(() => {
      strategyService.get.mockClear();
    });
  });

  describe('onQueueError()', () => {
    it.todo('should log the error to the console');
  });

  describe('onQueueCompleted()', () => {
    afterEach(() => {
      notificationLogService.log.mockClear();
      job.updateData.mockClear();
      job.log.mockClear();
    });

    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      const result = {};

      // Act.
      await consumser.onQueueCompleted(job, result);

      // Assert.
      expect(notificationLogService.log).toHaveBeenCalledWith(
        job,
        'completed',
        result,
        null,
      );
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = {
        ...job.data,
        notification_database_id: id,
      };
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumser.onQueueCompleted(job, null);

      // Assert.
      expect(job.updateData).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumser.onQueueCompleted(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await consumser.onQueueCompleted(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('onQueueFailed()', () => {
    afterEach(() => {
      notificationLogService.log.mockClear();
      job.updateData.mockClear();
      job.log.mockClear();
    });

    it("should create or update the job's notification log in the database", async () => {
      // Arrange.
      const error = new Error();

      // Act.
      await consumser.onQueueFailed(job, error);

      // Assert.
      expect(notificationLogService.log).toHaveBeenCalledWith(
        job,
        'failed',
        null,
        error,
      );
    });

    it("should update the job's payload with with the notification log's id", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = {
        ...job.data,
        notification_database_id: id,
      };
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumser.onQueueFailed(job, null);

      // Assert.
      expect(job.updateData).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumser.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await consumser.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });
  });
});
