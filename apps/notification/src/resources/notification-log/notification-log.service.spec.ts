import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobState } from 'bullmq';
import { DataSource, In } from 'typeorm';
import {
  MockDataSource,
  MockRepository,
  createMockDataSource,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { NotificationAttempt } from './entities/notification-attempt.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';

describe('NotificationLogService', () => {
  let service: NotificationLogService;
  let notificationLogRepository: MockRepository;
  let notificationAttemptRepository: MockRepository;
  let dataSource: MockDataSource;

  const notificationLog: NotificationLog = {
    id: 'test1',
    job: JSON.stringify({}),
    state: 'completed',
    attempts: 0,
    data: JSON.stringify({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as NotificationLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationLogService,
        {
          provide: getModelToken(NotificationLog),
          useValue: createMockRepository<NotificationLog>(),
        },
        {
          provide: getModelToken(NotificationAttempt),
          useValue: createMockRepository<NotificationAttempt>(),
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(),
        },
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    notificationLogRepository = module.get<MockRepository>(
      getModelToken(NotificationLog),
    );
    notificationAttemptRepository = module.get<MockRepository>(
      getModelToken(NotificationAttempt),
    );
    dataSource = module.get<MockDataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      notificationLogRepository.find.mockClear();
    });

    it('should yield a list of notification logs', async () => {
      // Arrange.
      const expectedResult: NotificationLog[] = [notificationLog];
      notificationLogRepository.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll([], [])).resolves.toEqual(expectedResult);
    });

    it('should yield a list filtered by job name(s)', async () => {
      // Arrange.
      const jobs = ['email', 'sms'];
      const expectedResult = {
        where: { job: In(jobs) },
        relations: { attemptHistory: true },
      };
      notificationLogRepository.find.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll(jobs, []);

      // Assert.
      expect(notificationLogRepository.find).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield a list filtered by job state(s)', async () => {
      // Arrange.
      const states: JobState[] = ['completed'];
      const expectedResult = {
        where: { state: In(states) },
        relations: { attemptHistory: true },
      };
      notificationLogRepository.find.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll([], states);

      // Assert.
      expect(notificationLogRepository.find).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield an empty list if the repository return an empty list', async () => {
      // Arrange.
      notificationLogRepository.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll([], [])).resolves.toHaveLength(0);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      notificationLogRepository.findOne.mockClear();
    });

    it('should yield a notification log', async () => {
      // Arrange.
      notificationLogRepository.findOne.mockResolvedValue(notificationLog);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).resolves.toEqual(
        notificationLog,
      );
    });

    it('should yield null if the repository return null/undefined', async () => {
      // Arrange.
      notificationLogRepository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).resolves.toBeNull();
    });
  });

  describe('log()', () => {
    afterEach(() => {
      notificationLogRepository.create.mockClear();
      notificationLogRepository.preload.mockClear();
      notificationLogRepository.save.mockClear();
      notificationAttemptRepository.create.mockClear();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (no attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
      } as Job;
      const expectedResult = {
        job: job.name,
        state: 'delayed',
        attempts: job.attemptsMade,
        data: job.data,
        addedAt: new Date(job.timestamp),
        finishedAt: null,
        attemptHistory: [],
      };
      notificationLogRepository.create.mockResolvedValue({ id: 'test' });
      notificationLogRepository.save.mockResolvedValue(expectedResult);

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(notificationLogRepository.create).toHaveBeenCalledWith(
        expectedResult,
      );
      expect(notificationAttemptRepository.create).not.toHaveBeenCalled();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (completed attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
        processedOn: new Date().getTime(),
      } as Job;
      const expectedResult = {
        attempt: job.attemptsMade,
        processedAt: new Date(job.processedOn),
        result: null,
        error: null,
      };
      notificationLogRepository.create.mockResolvedValue({
        id: 'test',
      });
      notificationLogRepository.save.mockResolvedValue({
        id: 'test',
      });

      // Act.
      await service.log(job, 'completed', null, null);

      // Assert.
      expect(notificationLogRepository.create).toHaveBeenCalled();
      expect(notificationAttemptRepository.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined (failed attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: {},
        timestamp: new Date().getTime(),
        processedOn: new Date().getTime(),
      } as Job;
      const expectedResult = {
        attempt: job.attemptsMade,
        processedAt: new Date(job.processedOn),
        result: null,
        error: null,
      };
      notificationLogRepository.create.mockResolvedValue({
        id: 'test',
      });
      notificationLogRepository.save.mockResolvedValue({
        id: 'test',
      });

      // Act.
      await service.log(job, 'failed', null, null);

      // Assert.
      expect(notificationLogRepository.create).toHaveBeenCalled();
      expect(notificationAttemptRepository.create).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should update a notification log if the "notification_datatbase_id" property is defined (no attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const log = {
        attempts: 1,
      };
      const expectedResult = {
        state: 'delayed',
        attempts: job.attemptsMade,
        data: {},
        finishedAt: null,
      };
      notificationLogRepository.preload.mockResolvedValue({
        state: expectedResult.state,
        attempts: job.attemptsMade,
        data: expectedResult.data,
        finishedAt: null,
      });
      notificationLogRepository.save.mockResolvedValue(expectedResult);

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(notificationLogRepository.save).toHaveBeenCalledWith(
        expectedResult,
      );
      expect(notificationAttemptRepository.create).not.toHaveBeenCalled();
    });

    it.todo(
      'should update a notification log if the "notification_database_id" property is defined (completed attempt)',
    );

    it.todo(
      'should update a notification log if the "notification_database_id" property is defined (failed attempt)',
    );

    it("should yield the notification log's database id (create)", async () => {
      // Arrange.
      const job = { name: 'email', attemptsMade: 2, data: {} } as Job;
      const expectedId = 'test';
      notificationLogRepository.create.mockResolvedValue({ id: expectedId });
      notificationLogRepository.save.mockResolvedValue({ id: expectedId });

      // Act/Assert.
      await expect(service.log(job, 'completed', null, null)).resolves.toBe(
        expectedId,
      );
    });

    it("should yield the notification log's database id (update)", async () => {
      // Arrange.
      const expectedResult = 'test';
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: expectedResult },
      } as Job;
      const log = {
        attempts: 1,
      };
      notificationLogRepository.preload.mockResolvedValue(log);
      notificationLogRepository.save.mockResolvedValue({ id: expectedResult });

      // Act/Assert.
      await expect(service.log(job, 'failed', null, null)).resolves.toBe(
        expectedResult,
      );
    });
  });
});
