import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobState } from 'bullmq';
import { DataSource, In } from 'typeorm';
import {
  MockDataSource,
  MockRepository,
  createMockDataSource,
  createMockRepository,
} from '../../../test/helpers/database.helper';
import { NotificationAttemptEntity } from './entities/notification-attempt.entity';
import { NotificationLogEntity } from './entities/notification-log.entity';
import { OrmNotificationLogRepository } from './orm-notification-log.repository';
import { NotificationLogProfile } from '../profiles/notification-log.profile';
import { NotificationLog } from '../domain/notification-log';

describe('OrmNotificationLogRepository', () => {
  let repository: OrmNotificationLogRepository;
  let notificationLogRepository: MockRepository;
  let notificationAttemptRepository: MockRepository;
  let dataSource: MockDataSource;

  const entity = new NotificationLogEntity();
  entity.id = 'test1';
  entity.job = JSON.stringify({});
  entity.state = 'completed';
  entity.attempts = 0;
  entity.data = JSON.stringify({});
  entity.addedAt = new Date();
  entity.finishedAt = new Date();
  entity.createdAt = new Date();
  entity.updatedAt = new Date();
  entity.attemptHistory = [];

  const log = new NotificationLog();
  log.id = entity.id;
  log.job = entity.job;
  log.state = entity.state;
  log.attempts = entity.attempts;
  log.data = JSON.parse(entity.data);
  log.addedAt = entity.addedAt;
  log.finishedAt = entity.finishedAt;
  entity.finishedAt = new Date();
  log.createdAt = entity.createdAt;
  log.updatedAt = entity.updatedAt;
  log.attemptHistory = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
      providers: [
        OrmNotificationLogRepository,
        NotificationLogProfile,
        {
          provide: getRepositoryToken(NotificationLogEntity),
          useValue: createMockRepository<NotificationLogEntity>(),
        },
        {
          provide: getRepositoryToken(NotificationAttemptEntity),
          useValue: createMockRepository<NotificationAttemptEntity>(),
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(),
        },
      ],
    }).compile();

    repository = module.get<OrmNotificationLogRepository>(
      OrmNotificationLogRepository,
    );
    notificationLogRepository = module.get<MockRepository>(
      getRepositoryToken(NotificationLogEntity),
    );
    notificationAttemptRepository = module.get<MockRepository>(
      getRepositoryToken(NotificationAttemptEntity),
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
      const expectedResult = [log];
      notificationLogRepository.find.mockResolvedValue([entity]);

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
      notificationLogRepository.find.mockResolvedValue([entity]);

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
      notificationLogRepository.find.mockResolvedValue([entity]);

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
      notificationLogRepository.findOne.mockResolvedValue(entity);

      // Act/Assert.
      await expect(repository.findOne(entity.id)).resolves.toEqual(log);
    });

    it('should yield null if the repository return null/undefined', async () => {
      // Arrange.
      notificationLogRepository.findOne.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findOne(entity.id)).resolves.toBeNull();
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
