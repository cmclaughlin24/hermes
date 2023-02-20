import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobStatus } from 'bull';
import {
  createMockRepository,
  MockRepository
} from '../../../../notification/test/helpers/database.helpers';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';

describe('NotificationLogService', () => {
  let service: NotificationLogService;
  let notificationLogModel: MockRepository;

  const notificationLog: NotificationLog = {
    id: 'test1',
    job: JSON.stringify({}),
    status: 'completed',
    attempts: 0,
    data: JSON.stringify({}),
    result: null,
    error: null,
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
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    notificationLogModel = module.get<MockRepository>(
      getModelToken(NotificationLog),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      notificationLogModel.findAll.mockClear();
    });

    it('should yield a list of notification logs', async () => {
      // Arrange.
      const expectedResult: NotificationLog[] = [notificationLog];
      notificationLogModel.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll([], [])).resolves.toEqual(expectedResult);
    });

    it('should yield a list filtered by job name', async () => {
      // Arrange.
      const jobs = ['email', 'sms'];
      const expectedResult = { where: { status: [], job: jobs } };
      notificationLogModel.findAll.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll(jobs, []);

      // Assert.
      expect(notificationLogModel.findAll).toHaveBeenCalledWith(expectedResult);
    });

    it('should yield a list filtered by job status', async () => {
      // Arrange.
      const statuses: JobStatus[] = ['completed'];
      const expectedResult = { where: { status: statuses, job: [] } };
      notificationLogModel.findAll.mockResolvedValue([notificationLog]);

      // Act.
      await service.findAll([], statuses);

      // Assert.
      expect(notificationLogModel.findAll).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification logs not found!`,
      );
      notificationLogModel.findAll.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findAll([], [])).rejects.toEqual(expectedResult);
    });

    it('should throw a "NotFoundException" if the repository return an empty list', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification logs not found!`,
      );
      notificationLogModel.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll([], [])).rejects.toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    afterEach(() => {
      notificationLogModel.findByPk.mockClear();
    });

    it('should yield a notification log', async () => {
      // Arrange.
      notificationLogModel.findByPk.mockResolvedValue(notificationLog);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).resolves.toEqual(
        notificationLog,
      );
    });

    it('should throw a "NotFoundException" if the repository return null/undefined', async () => {
      // Arrange.
      const expectedResult = new NotFoundException(
        `Notification Log with ${notificationLog.id} not found!`,
      );
      notificationLogModel.findByPk.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findOne(notificationLog.id)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('createOrUpdate()', () => {
    afterEach(() => {
      notificationLogModel.create.mockClear();
      notificationLogModel.update.mockClear();
    });

    it('should create a notification log if the "notification_database_id" property is null/undefined', async () => {
      // Arrange.
      const job = { name: 'email', attemptsMade: 2, data: {} } as Job;
      const expectedResult = {
        job: job.name,
        status: 'completed',
        attempts: job.attemptsMade,
        data: job.data,
        result: null,
        error: null,
      };
      notificationLogModel.create.mockResolvedValue({ id: 'test' });

      // Act.
      await service.createOrUpdate(job, 'completed', null, null);

      // Assert.
      expect(notificationLogModel.create).toHaveBeenLastCalledWith(
        expectedResult,
      );
    });

    it('should update a notification log if the "notification_datatbase_id" property is defined', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const log = {
        attempts: 1,
        update: jest.fn(() => ({ id: 'test' })),
      };
      const expectedResult = {
        job: job.name,
        status: 'failed',
        attempts: job.attemptsMade,
        data: {},
        result: null,
        error: null,
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await service.createOrUpdate(job, 'failed', null, null);

      // Assert.
      expect(log.update).toHaveBeenCalledWith(expectedResult);
    });

    it("should yield the notification log's database id (create)", async () => {
      // Arrange.
      const job = { name: 'email', attemptsMade: 2, data: {} } as Job;
      const expectedId = 'test';
      notificationLogModel.create.mockResolvedValue({ id: 'test' });

      // Act/Assert.
      await expect(
        service.createOrUpdate(job, 'completed', null, null),
      ).resolves.toBe(expectedId);
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
        update: jest.fn(() => ({ id: expectedResult })),
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act/Assert.
      await expect(
        service.createOrUpdate(job, 'failed', null, null),
      ).resolves.toBe(expectedResult);
    });

    it('should not update a notification log if the number of attempts in the notification log are greater than the number attempts in the job', async () => {
      // Arrange.
      const job = {
        name: 'email',
        attemptsMade: 2,
        data: { notification_database_id: 'test' },
      } as Job;
      const log = {
        attempts: 3,
        update: jest.fn(() => ({ id: 'test' })),
      };
      notificationLogModel.findByPk.mockResolvedValue(log);

      // Act.
      await service.createOrUpdate(job, 'failed', null, null);

      // Assert.
      expect(log.update).not.toHaveBeenCalled();
    });
  });
});
