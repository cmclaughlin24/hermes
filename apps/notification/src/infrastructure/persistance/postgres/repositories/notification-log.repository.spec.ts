import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobState } from 'bullmq';
import { DataSource, In } from 'typeorm';
import {
  MockDataSource,
  MockRepository,
  createMockDataSource,
  createMockRepository,
} from '../../../../../test/helpers/database.helper';
import { NotificationAttempt } from '../entities/notification-attempt.entity';
import { NotificationLog } from '../entities/notification-log.entity';
import { PostgresNotificationLogRepository } from './notification-log.repository';

describe('PostgresNotificationLogRepository', () => {
  let repository: PostgresNotificationLogRepository;
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
        PostgresNotificationLogRepository,
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

    repository = module.get<PostgresNotificationLogRepository>(
      PostgresNotificationLogRepository,
    );
    notificationLogRepository = module.get<MockRepository>(
      getModelToken(NotificationLog),
    );
    notificationAttemptRepository = module.get<MockRepository>(
      getModelToken(NotificationAttempt),
    );
    dataSource = module.get<MockDataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
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
      await expect(repository.findAll([], [])).resolves.toEqual(expectedResult);
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
      await repository.findAll(jobs, []);

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
      await repository.findAll([], states);

      // Assert.
      expect(notificationLogRepository.find).toHaveBeenCalledWith(
        expectedResult,
      );
    });

    it('should yield an empty list if the repository return an empty list', async () => {
      // Arrange.
      notificationLogRepository.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll([], [])).resolves.toHaveLength(0);
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
      await expect(repository.findOne(notificationLog.id)).resolves.toEqual(
        notificationLog,
      );
    });

    it('should yield null if the repository return null/undefined', async () => {
      // Arrange.
      notificationLogRepository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(notificationLog.id)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    it.todo('should create a notification log');

    it.todo('should yield the created a notification log');

    it.todo(
      'should throw an "ExistsException" if a notification log already exists',
    );
  });

  describe('update()', () => {
    it.todo('should update a notification log');

    it.todo('should yield the update a notification log');

    it.todo(
      'should throw a "MissingException" if the repository returns null/undefined',
    );
  });
});
