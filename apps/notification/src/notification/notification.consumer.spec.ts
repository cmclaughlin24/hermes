import { Test, TestingModule } from '@nestjs/testing';
import { UnrecoverableError } from 'bullmq';
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
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { DtoValidationException } from '../common/errors/dto-validation.error';

type MockNotifierStrategy = Record<
  keyof NotifierStrategy<NotificationDto>,
  jest.Mock
>;

const createNotifierStrategyMock = (): MockNotifierStrategy => ({
  createTemplate: jest.fn(),
  createNotificationDto: jest.fn(),
  notify: jest.fn(),
});

describe('NotificationConsumer', () => {
  let consumer: NotificationConsumer;
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

    consumer = module.get<NotificationConsumer>(NotificationConsumer);
    notificationLogService = module.get<MockNotificationLogService>(
      NotificationLogService,
    );
    strategyService = module.get<MockNotifierStrategyService>(
      NotifierStrategyService,
    );
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('process()', () => {
    let strategy: MockNotifierStrategy;
    const dto = {};

    beforeEach(() => {
      strategy = createNotifierStrategyMock();
      strategyService.get.mockReturnValue(strategy);
    });

    afterEach(() => {
      strategyService.get.mockClear();
    });

    it('should yield the created notification', async () => {
      // Arrange.
      const expectedResult = {};
      strategy.createNotificationDto.mockResolvedValue(dto);
      strategy.createTemplate.mockResolvedValue(dto);
      strategy.notify.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(consumer.process(job)).resolves.toEqual(expectedResult);
    });

    it("should validate the job's payload is valid", async () => {
      // Arrange.
      strategy.createNotificationDto.mockResolvedValue(dto);
      strategy.createTemplate.mockResolvedValue(dto);
      strategy.notify.mockResolvedValue(null);

      // Act.
      await consumer.process(job);

      // Assert.
      expect(strategy.createNotificationDto).toHaveBeenCalledWith(job.data);
    });

    it('should throw an "UnrecoverableError" if the job\'s payload is invalid', async () => {
      // Arrange.
      const error = new DtoValidationException('unit testing');
      const expectedResult = new UnrecoverableError(
        `[${NotificationConsumer.name} process] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
      );
      strategy.createNotificationDto.mockRejectedValue(error);

      // Act/Assert.
      await expect(consumer.process(job)).rejects.toEqual(expectedResult);
    });

    it('should generate an email template', async () => {
      // Arrange.
      strategy.createNotificationDto.mockResolvedValue(dto);
      strategy.createTemplate.mockResolvedValue(dto);
      strategy.notify.mockResolvedValue(null);

      // Act.
      await consumer.process(job);

      // Assert.
      expect(strategy.createTemplate).toHaveBeenCalledWith(dto);
    });

    it('should throw an "UnrecoverableError" if a template cannot be generated', async () => {
      // Arrange.
      const error = new DtoValidationException(
        `Invalid Argument: ${CreateEmailNotificationDto.name} must have either 'html' or 'template' keys present`,
      );
      const expectedResult = new UnrecoverableError(
        `[${NotificationConsumer.name} process] Job ${job.id}: Invalid payload (validation errors) ${error.message}`,
      );
      strategy.createNotificationDto.mockResolvedValue(dto);
      strategy.createTemplate.mockRejectedValue(error);

      // Act/Assert.
      await expect(consumer.process(job)).rejects.toEqual(expectedResult);
    });

    it('should throw an "Error" if an email failed to send', async () => {
      // Arrange.
      const expectedResult = new Error('Something went wrong');
      strategy.createNotificationDto.mockResolvedValue(dto);
      strategy.createTemplate.mockResolvedValue(dto);
      strategy.notify.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(consumer.process(job)).rejects.toEqual(expectedResult);
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
      await consumer.onQueueCompleted(job, result);

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
      await consumer.onQueueCompleted(job, null);

      // Assert.
      expect(job.updateData).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumer.onQueueCompleted(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueCompleted] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await consumer.onQueueCompleted(job, null);

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
      await consumer.onQueueFailed(job, error);

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
      await consumer.onQueueFailed(job, null);

      // Assert.
      expect(job.updateData).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (sucess)", async () => {
      // Arrange.
      const id = 'test';
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Result stored in database ${id}`;
      notificationLogService.log.mockResolvedValue(id);

      // Act.
      await consumer.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });

    it("should add the method's result to the job (fail)", async () => {
      // Arrange.
      const expectedResult = `[${NotificationConsumer.name} onQueueFailed] Job ${job.id}: Failed to store result in database`;
      notificationLogService.log.mockRejectedValue(new Error());

      // Act.
      await consumer.onQueueFailed(job, null);

      // Assert.
      expect(job.log).toHaveBeenCalledWith(expectedResult);
    });
  });
});
