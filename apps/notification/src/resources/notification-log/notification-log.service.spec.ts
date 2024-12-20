import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { NotificationLogService } from './notification-log.service';
import { NotificationLog } from '../../infrastructure/persistance/postgres/entities/notification-log.entity';
import { NotificationLogRepository } from './repository/notification-log.repository';

type MockNotificationLogRepository = Partial<
  Record<keyof NotificationLogRepository, jest.Mock>
>;

const createNotificationLogRepositoryMock =
  (): MockNotificationLogRepository => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  });

describe('NotificationLogService', () => {
  let service: NotificationLogService;
  let notificationLogRepository: MockNotificationLogRepository;

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
          provide: NotificationLogRepository,
          useValue: createNotificationLogRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    notificationLogRepository = module.get<MockNotificationLogRepository>(
      NotificationLogRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      notificationLogRepository.findAll.mockClear();
    });

    it('should yield a list of notification logs', async () => {
      // Arrange.
      const expectedResult: NotificationLog[] = [notificationLog];
      notificationLogRepository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll([], [])).resolves.toEqual(expectedResult);
    });

    it('should yield a list filtered by job name(s)', async () => {
      // Arrange.
      const jobs = ['email', 'sms'];
      notificationLogRepository.findAll.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll(jobs, []);

      // Assert.
      expect(notificationLogRepository.findAll).toHaveBeenCalledWith(jobs, []);
    });

    it('should yield an empty list if the repository return an empty list', async () => {
      // Arrange.
      notificationLogRepository.findAll.mockResolvedValue([]);

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
      notificationLogRepository.update.mockClear();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined', async () => {
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
      notificationLogRepository.create.mockResolvedValue(expectedResult);

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(notificationLogRepository.create).toHaveBeenCalledWith(
        job,
        'delayed',
        null,
        null,
      );
    });

    it('should update a notification log if the "notification_datatbase_id" property is defined (no attempt)', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const expectedResult = {
        state: 'delayed',
        attempts: job.attemptsMade,
        data: {},
        finishedAt: null,
      };
      notificationLogRepository.update.mockResolvedValue(expectedResult);

      // Act.
      await service.log(job, 'delayed', null, null);

      // Assert.
      expect(notificationLogRepository.update).toHaveBeenCalledWith(
        job,
        'delayed',
        null,
        null,
      );
    });

    it("should yield the notification log's database id (create)", async () => {
      // Arrange.
      const job = { name: 'email', attemptsMade: 2, data: {} } as Job;
      const expectedId = 'test';
      notificationLogRepository.create.mockResolvedValue(expectedId);

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
      notificationLogRepository.update.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.log(job, 'failed', null, null)).resolves.toBe(
        expectedResult,
      );
    });
  });
});
